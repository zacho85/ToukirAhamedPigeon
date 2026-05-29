import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);
  private readonly baseUrl: string;
  private readonly collectionKey: string;
  private readonly collectionUserId: string;
  private readonly collectionApiKey: string;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get<string>('MOMO_BASE_URL') || 'https://sandbox.momodeveloper.mtn.com';
    this.collectionKey = this.config.get<string>('MOMO_COLLECTION_PRIMARY_KEY') || '';
    this.collectionUserId = this.config.get<string>('MOMO_COLLECTION_USER_ID') || '';
    this.collectionApiKey = this.config.get<string>('MOMO_COLLECTION_API_KEY') || '';
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.collectionUserId}:${this.collectionApiKey}`).toString('base64');

    const response = await axios.post(
      `${this.baseUrl}/collection/token/`,
      {},
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Ocp-Apim-Subscription-Key': this.collectionKey,
        },
      },
    );

    return response.data.access_token;
  }

  async requestToPay(params: {
    amount: number;
    currency: string;
    phoneNumber: string;
    externalId: string;
    payerMessage?: string;
    payeeNote?: string;
  }): Promise<{ referenceId: string }> {
    if (!this.collectionKey || !this.collectionUserId || !this.collectionApiKey) {
      throw new Error('MTN MoMo API credentials not configured. Set MOMO_COLLECTION_PRIMARY_KEY, MOMO_COLLECTION_USER_ID, and MOMO_COLLECTION_API_KEY in .env');
    }

    const token = await this.getAccessToken();
    const referenceId = crypto.randomUUID();

    await axios.post(
      `${this.baseUrl}/collection/v1_0/requesttopay`,
      {
        amount: params.amount.toString(),
        currency: params.currency,
        externalId: params.externalId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: params.phoneNumber.replace(/[^0-9]/g, ''),
        },
        payerMessage: params.payerMessage || 'Wallet top-up',
        payeeNote: params.payeeNote || 'KongossaPay Top-Up',
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Reference-Id': referenceId,
          'Ocp-Apim-Subscription-Key': this.collectionKey,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      },
    );

    return { referenceId };
  }

  async getTransactionStatus(referenceId: string): Promise<{
    status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
    amount?: string;
    currency?: string;
  }> {
    const token = await this.getAccessToken();

    const response = await axios.get(
      `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Ocp-Apim-Subscription-Key': this.collectionKey,
        },
      },
    );

    return {
      status: response.data.status,
      amount: response.data.amount,
      currency: response.data.currency,
    };
  }

  getAvailableCurrencies(): Record<string, string> {
    return {
      GH: 'GHS',
      UG: 'UGX',
      RW: 'RWF',
      ZM: 'ZMW',
      MW: 'MWK',
      CI: 'XOF',
      BJ: 'XOF',
      SN: 'XOF',
      CM: 'XAF',
      CG: 'XAF',
      GA: 'XAF',
      TZ: 'TZS',
      SZ: 'SZL',
      LR: 'LRD',
      GN: 'GNF',
      CD: 'CDF',
      NG: 'NGN',
    };
  }

  getCurrencyFromCountry(countryCode: string): string {
    const map = this.getAvailableCurrencies();
    return map[countryCode.toUpperCase()] || 'USD';
  }
}
