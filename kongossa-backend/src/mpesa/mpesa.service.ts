import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Safaricom Daraja API — STK Push (Lipa Na M-Pesa Online), Kenya only.
 * Docs: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
 *
 * Sandbox test credentials are self-service and free (no approval wait) at
 * https://developer.safaricom.co.ke — MPESA_CONSUMER_KEY/SECRET must come from
 * a real (even sandbox) app registered there; there is no safe default for them.
 * MPESA_SHORTCODE (174379) and the sandbox MPESA_PASSKEY are Safaricom's own
 * published test constants, safe to default — but confirm the passkey against
 * the current Daraja docs before relying on it; Safaricom has rotated it before.
 */
@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly shortCode: string;
  private readonly passkey: string;
  private readonly callbackUrl: string;

  private accessToken = '';
  private tokenExpiresAt = 0;

  constructor(private config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('MPESA_BASE_URL') ||
      'https://sandbox.safaricom.co.ke';
    this.consumerKey = this.config.get<string>('MPESA_CONSUMER_KEY') || '';
    this.consumerSecret =
      this.config.get<string>('MPESA_CONSUMER_SECRET') || '';
    this.shortCode = this.config.get<string>('MPESA_SHORTCODE') || '174379';
    this.passkey = this.config.get<string>('MPESA_PASSKEY') || '';
    this.callbackUrl = this.config.get<string>('MPESA_CALLBACK_URL') || '';
  }

  getCurrencyFromCountry(countryCode: string): string {
    // Daraja only operates in Kenya; kept for interface parity with the other
    // mobile-money services, which the frontend/wallet-topup layer treats uniformly.
    return countryCode?.toUpperCase() === 'KE' ? 'KES' : 'KES';
  }

  /** Normalizes any common Kenyan phone format to the 2547XXXXXXXX MSISDN Daraja expects. */
  private normalizeKenyanMsisdn(phone: string): string {
    const digits = (phone || '').replace(/[^0-9]/g, '');

    if (digits.startsWith('254') && digits.length === 12) return digits;
    if (digits.startsWith('0') && digits.length === 10)
      return `254${digits.slice(1)}`;
    if (
      (digits.startsWith('7') || digits.startsWith('1')) &&
      digits.length === 9
    )
      return `254${digits}`;

    throw new BadRequestException(
      `Invalid Kenyan phone number for M-Pesa: ${phone}`,
    );
  }

  private timestamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
      `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    );
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error(
        'M-Pesa API credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env',
      );
    }

    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`,
    ).toString('base64');

    const response = await axios.get(`${this.baseUrl}/oauth/v1/generate`, {
      params: { grant_type: 'client_credentials' },
      headers: { Authorization: `Basic ${auth}` },
    });

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt =
      Date.now() + (Number(response.data.expires_in) - 60) * 1000;

    return this.accessToken;
  }

  async requestToPay(data: {
    amount: number;
    currency: string;
    phoneNumber: string;
    externalId: string;
    payerMessage: string;
    payeeNote: string;
  }): Promise<{ referenceId: string }> {
    if (!this.consumerKey || !this.consumerSecret) {
      throw new Error(
        'M-Pesa API credentials not configured. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in .env',
      );
    }
    if (!this.passkey) {
      throw new Error(
        'M-Pesa STK Push credentials not configured. Set MPESA_PASSKEY in .env',
      );
    }
    if (!this.callbackUrl) {
      throw new Error(
        'M-Pesa callback URL not configured. Set MPESA_CALLBACK_URL to a public HTTPS URL Safaricom can reach',
      );
    }

    const token = await this.getAccessToken();
    const phone = this.normalizeKenyanMsisdn(data.phoneNumber);
    const ts = this.timestamp();
    const password = Buffer.from(
      `${this.shortCode}${this.passkey}${ts}`,
    ).toString('base64');

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(data.amount),
        PartyA: phone,
        PartyB: this.shortCode,
        PhoneNumber: phone,
        CallBackURL: this.callbackUrl,
        AccountReference: data.externalId,
        TransactionDesc: data.payerMessage || 'Wallet top-up',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      },
    );

    if (response.data.ResponseCode !== '0') {
      throw new Error(
        `M-Pesa STK push rejected: ${response.data.ResponseDescription || 'unknown error'}`,
      );
    }

    this.logger.log(
      `M-Pesa STK push sent, CheckoutRequestID: ${response.data.CheckoutRequestID}`,
    );
    return { referenceId: response.data.CheckoutRequestID };
  }

  /**
   * Queries Daraja's STK Push Query API directly. Callers should prefer
   * checking their own already-webhook-updated DB record first — Safaricom's
   * own docs note this query can be unreliable/slow immediately after
   * initiation, which is why errors here resolve to PENDING rather than
   * throwing (the frontend's polling loop simply tries again).
   */
  async getTransactionStatus(
    referenceId: string,
  ): Promise<{ status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' }> {
    try {
      const token = await this.getAccessToken();
      const ts = this.timestamp();
      const password = Buffer.from(
        `${this.shortCode}${this.passkey}${ts}`,
      ).toString('base64');

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        {
          BusinessShortCode: this.shortCode,
          Password: password,
          Timestamp: ts,
          CheckoutRequestID: referenceId,
        },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 },
      );

      const resultCode = String(response.data.ResultCode);
      if (resultCode === '0') return { status: 'SUCCESSFUL' };
      // Flag: 1032 (cancelled by user) / 1037 (timeout) confirmed against Daraja's
      // public docs at the time this was written — verify against current docs,
      // Safaricom has added result codes over time.
      if (resultCode === '1032' || resultCode === '1037')
        return { status: 'FAILED' };
      return { status: 'PENDING' };
    } catch (error: any) {
      this.logger.warn(
        `M-Pesa status query inconclusive for ${referenceId}: ${error.message}`,
      );
      return { status: 'PENDING' };
    }
  }
}
