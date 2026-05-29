import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OrangeMoneyService {
  private readonly logger = new Logger(OrangeMoneyService.name);
  private readonly baseUrl = 'https://api.orange.com';
  private readonly authHeader: string;
  private readonly merchantKey: string;
  private readonly country: string;
  private accessToken: string = '';
  private tokenExpiresAt: number = 0;

  constructor(private config: ConfigService) {
    this.authHeader = this.config.get<string>('ORANGE_MONEY_AUTH_HEADER') || '';
    this.merchantKey = this.config.get<string>('ORANGE_MONEY_MERCHANT_KEY') || '';
    this.country = this.config.get<string>('ORANGE_MONEY_COUNTRY') || 'dev';
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken !== '' && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await axios.post(
      `${this.baseUrl}/oauth/v3/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${this.authHeader}`,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  async createPaymentSession(params: {
    amount: number;
    currency?: string;
    orderId: string;
    returnUrl: string;
    cancelUrl: string;
    notifUrl: string;
    lang?: string;
  }): Promise<{
    payToken: string;
    paymentUrl: string;
    notifToken: string;
  }> {
    if (!this.authHeader || !this.merchantKey) {
      throw new Error('Orange Money API credentials not configured. Check ORANGE_MONEY_AUTH_HEADER and ORANGE_MONEY_MERCHANT_KEY in .env');
    }

    const token = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseUrl}/orange-money-webpay/${this.country}/v1/webpayment`,
      {
        merchant_key: this.merchantKey,
        currency: params.currency || 'OUV',
        order_id: params.orderId,
        amount: params.amount,
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        notif_url: params.notifUrl,
        lang: params.lang || 'en',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    return {
      payToken: response.data.pay_token,
      paymentUrl: response.data.payment_url,
      notifToken: response.data.notif_token,
    };
  }

  async checkTransactionStatus(params: {
    orderId: string;
    amount: number;
    payToken: string;
  }): Promise<{
    status: string;
    orderId?: string;
    txnId?: string;
  }> {
    const token = await this.getAccessToken();

    const response = await axios.post(
      `${this.baseUrl}/orange-money-webpay/${this.country}/v1/transactionstatus`,
      {
        order_id: params.orderId,
        amount: params.amount,
        pay_token: params.payToken,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return {
      status: response.data.status,
      orderId: response.data.order_id,
      txnId: response.data.txnid,
    };
  }

  getAvailableCurrencies(): Record<string, string> {
    return {
      ML: 'XOF',
      CM: 'XAF',
      CI: 'XOF',
      SN: 'XOF',
      MG: 'MGA',
      BW: 'BWP',
      GN: 'GNF',
      GW: 'XOF',
      SL: 'SLL',
      CD: 'CDF',
      CF: 'XAF',
      LR: 'LRD',
    };
  }

  getCurrencyFromCountry(countryCode: string): string {
    const map = this.getAvailableCurrencies();
    return map[countryCode.toUpperCase()] || 'OUV';
  }
}
