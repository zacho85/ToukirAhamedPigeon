import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Airtel Africa Open API — Collections ("Request to Pay"), generic across
 * OpCos (UG/TZ/KE/RW/ZM/MW/GH/NG — matches getCurrencyFromCountry below).
 * Docs: https://developers.airtel.africa (Collections product).
 *
 * Flag: the exact Collections endpoint path and the status-code vocabulary
 * returned by the status query are known to vary slightly by OpCo/API version.
 * The path and mapping below are written from Airtel's published reference —
 * confirm both against a live UAT call (openapiuat.airtel.africa) once
 * AIRTEL_CLIENT_ID/SECRET are available, and adjust rather than trust blindly.
 */
@Injectable()
export class AirtelMoneyService {
  private readonly logger = new Logger(AirtelMoneyService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly defaultCountry: string;
  private readonly callbackUrl: string;

  private accessToken = '';
  private tokenExpiresAt = 0;

  constructor(private config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('AIRTEL_BASE_URL') ||
      'https://openapiuat.airtel.africa';
    this.clientId = this.config.get<string>('AIRTEL_CLIENT_ID') || '';
    this.clientSecret = this.config.get<string>('AIRTEL_CLIENT_SECRET') || '';
    this.defaultCountry = this.config.get<string>('AIRTEL_COUNTRY') || '';
    this.callbackUrl = this.config.get<string>('AIRTEL_CALLBACK_URL') || '';
  }

  getCurrencyFromCountry(countryCode: string): string {
    const map: Record<string, string> = {
      UG: 'UGX', // Uganda
      TZ: 'TZS', // Tanzania
      KE: 'KES', // Kenya
      RW: 'RWF', // Rwanda
      ZM: 'ZMW', // Zambia
      MW: 'MWK', // Malawi
      GH: 'GHS', // Ghana
      NG: 'NGN', // Nigeria
    };
    return map[countryCode?.toUpperCase()] || 'UGX';
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Airtel Money API credentials not configured. Set AIRTEL_CLIENT_ID and AIRTEL_CLIENT_SECRET in .env',
      );
    }

    const response = await axios.post(`${this.baseUrl}/auth/oauth2/token`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'client_credentials',
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
    countryCode: string;
  }): Promise<{ referenceId: string }> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        'Airtel Money API credentials not configured. Set AIRTEL_CLIENT_ID and AIRTEL_CLIENT_SECRET in .env',
      );
    }

    const country = (
      data.countryCode ||
      this.defaultCountry ||
      ''
    ).toUpperCase();
    if (!country) {
      throw new Error(
        'Airtel Money country could not be determined — set countryCode on the payment method or AIRTEL_COUNTRY in .env',
      );
    }

    const token = await this.getAccessToken();
    const msisdn = (data.phoneNumber || '').replace(/[^0-9]/g, '');

    const response = await axios.post(
      `${this.baseUrl}/merchant/v1/payments/`,
      {
        reference: data.externalId,
        subscriber: {
          country,
          currency: data.currency,
          msisdn,
        },
        transaction: {
          amount: data.amount,
          country,
          currency: data.currency,
          id: data.externalId,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Country': country,
          'X-Currency': data.currency,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    if (response.data?.status?.success === false) {
      throw new Error(
        `Airtel Money request rejected: ${response.data?.status?.message || 'unknown error'}`,
      );
    }

    // Airtel's own transaction id is the authoritative reference for status
    // queries/webhook matching; fall back to our generated externalId if the
    // provider response is missing it (mirrors MoMo's self-generated-reference
    // fallback pattern for a payment-initiate call with no useful body).
    const referenceId = response.data?.data?.transaction?.id || data.externalId;
    this.logger.log(
      `Airtel Money collection request sent, reference: ${referenceId}`,
    );
    return { referenceId };
  }

  /**
   * Queries Airtel's status endpoint directly. Callers should prefer checking
   * their own already-webhook-updated DB record first. Unrecognized/ambiguous
   * status codes resolve to PENDING rather than SUCCESSFUL, so an unmapped
   * code can never cause an incorrect wallet credit.
   */
  async getTransactionStatus(
    referenceId: string,
    countryCode?: string,
  ): Promise<{ status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' }> {
    const country = (countryCode || this.defaultCountry || '').toUpperCase();
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(
        `${this.baseUrl}/standard/v1/payments/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(country ? { 'X-Country': country } : {}),
          },
          timeout: 10000,
        },
      );

      const status = String(
        response.data?.data?.transaction?.status || '',
      ).toUpperCase();
      if (status === 'TS' || status === 'SUCCESS' || status === 'SUCCESSFUL')
        return { status: 'SUCCESSFUL' };
      if (status === 'TF' || status === 'FAILED') return { status: 'FAILED' };
      return { status: 'PENDING' };
    } catch (error: any) {
      this.logger.warn(
        `Airtel Money status query inconclusive for ${referenceId}: ${error.message}`,
      );
      return { status: 'PENDING' };
    }
  }
}
