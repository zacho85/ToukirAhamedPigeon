import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TransfiService {
  private readonly logger = new Logger(TransfiService.name);
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly mid: string;

  constructor(private config: ConfigService) {
    this.baseUrl = this.config.get<string>('TRANSFI_BASE_URL') || 'https://sandbox-api.transfi.com';
    const username = this.config.get<string>('TRANSFI_USERNAME') || '';
    const password = this.config.get<string>('TRANSFI_PASSWORD') || '';
    this.authHeader = Buffer.from(`${username}:${password}`).toString('base64');
    this.mid = this.config.get<string>('TRANSFI_MERCHANT_ID') || '';
  }

  private get headers() {
    return {
      Authorization: `Basic ${this.authHeader}`,
      mid: this.mid,
      'Content-Type': 'application/json',
    };
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  }): Promise<{ userId: string }> {
    let cleanPhone = data.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('260')) {
      cleanPhone = cleanPhone.substring(3);
    }

    const response = await axios.post(
      `${this.baseUrl}/v3/users/individual`,
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: cleanPhone,
        phoneCode: '+260',
        country: data.country,
        gender: 'male',
        date: '01-01-2000',
        address: {
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          postalCode: '00000',
        },
      },
      { headers: this.headers, timeout: 15000 },
    );

    return { userId: response.data.data.userId };
  }

  async createOrder(params: {
    userId: string;
    amount: number;
    currency?: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
  }): Promise<{ orderId: string; payUrl: string }> {
    if (!this.authHeader || !this.mid) {
      throw new Error('Transfi API credentials not configured. Check TRANSFI_USERNAME, TRANSFI_PASSWORD, and TRANSFI_MERCHANT_ID in .env');
    }

    const response = await axios.post(
      `${this.baseUrl}/v3/orders`,
      {
        userId: params.userId,
        orderType: 'payin',
        purposeCode: 'personal',
        source: {
          currency: params.currency || 'ZMW',
          amount: String(params.amount),
        },
        destination: {
          currency: 'USD',
        },
        successRedirectUrl: params.successRedirectUrl,
        failureRedirectUrl: params.failureRedirectUrl,
      },
      { headers: this.headers, timeout: 15000 },
    );

    return {
      orderId: response.data.data.orderId,
      payUrl: response.data.data.payUrl,
    };
  }

  async getOrderStatus(orderId: string): Promise<{
    status: string;
    sourceCurrency: string;
    sourceAmount: string;
    destinationCurrency: string;
    destinationAmount: string;
  }> {
    const response = await axios.get(
      `${this.baseUrl}/v3/orders/${orderId}`,
      { headers: this.headers, timeout: 10000 },
    );

    const data = response.data.data;
    return {
      status: data.status,
      sourceCurrency: data.source?.currency || 'ZMW',
      sourceAmount: data.source?.amount || '0',
      destinationCurrency: data.destination?.currency || 'USD',
      destinationAmount: data.destination?.amount || '0',
    };
  }
}
