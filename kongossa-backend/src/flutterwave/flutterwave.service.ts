import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class FlutterwaveService {
  private readonly logger = new Logger(FlutterwaveService.name);
  private readonly secretKey: string | null;
  private readonly isEnabled: boolean;
  private readonly baseUrl = 'https://api.flutterwave.com/v3';

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secretKey = this.config.get<string>('FLUTTERWAVE_SECRET_KEY');
    this.isEnabled = !!this.secretKey;
    if (!this.isEnabled) {
      this.logger.warn('⚠️ Flutterwave is disabled: FLUTTERWAVE_SECRET_KEY not set.');
    }
  }

  private ensureEnabled() {
    if (!this.isEnabled) {
      throw new BadRequestException('Flutterwave service is not configured.');
    }
  }

  async initializePayment(data: {
    amount: number;
    email: string;
    tx_ref: string;
    redirectUrl: string;
    metadata?: Record<string, any>;
    currency?: string;
  }) {
    this.ensureEnabled();
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          tx_ref: data.tx_ref,
          amount: data.amount,
          currency: data.currency || 'NGN',
          redirect_url: data.redirectUrl,
          payment_options: 'card,banktransfer,ussd',
          meta: data.metadata || {},
          customer: { email: data.email },
          customizations: {
            title: 'Kongossa Pay Wallet Top-up',
            description: 'Top up your wallet',
            logo: 'https://kongossapay.com/logo.png',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.status === 'success') {
        return {
          paymentLink: response.data.data.link,
          tx_ref: response.data.data.tx_ref,
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      this.logger.error('Flutterwave initialization failed', error);
      throw new BadRequestException('Flutterwave payment initialization failed');
    }
  }

  async verifyPayment(tx_ref: string) {
    this.ensureEnabled();
    try {
      const response = await axios.get(
        `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${tx_ref}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
        }
      );
      if (response.data.status === 'success') {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      this.logger.error(`Flutterwave verification failed for ${tx_ref}`, error);
      throw new BadRequestException('Flutterwave verification failed');
    }
  }

  async handleWebhook(payload: any) {
    if (!this.isEnabled) {
      this.logger.warn('Webhook ignored: Flutterwave not configured.');
      return null;
    }
    if (payload.event === 'charge.completed') {
      const { tx_ref, amount, status } = payload.data;
      if (status === 'successful') {
        return { tx_ref, amount };
      }
    }
    return null;
  }
}