import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly secretKey: string | null;
  private readonly isEnabled: boolean;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.secretKey = this.config.get<string>('PAYSTACK_SECRET_KEY');
    this.isEnabled = !!this.secretKey;
    if (!this.isEnabled) {
      this.logger.warn('⚠️ Paystack is disabled: PAYSTACK_SECRET_KEY not set.');
    }
  }

  private ensureEnabled() {
    if (!this.isEnabled) {
      throw new BadRequestException('Paystack service is not configured.');
    }
  }

  async initializePayment(data: {
    amount: number;
    email: string;
    reference: string;
    callbackUrl: string;
    metadata?: Record<string, any>;
  }) {
    this.ensureEnabled();
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: Math.round(data.amount * 100),
          email: data.email,
          reference: data.reference,
          callback_url: data.callbackUrl,
          metadata: data.metadata || {},
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.status) {
        return {
          authorizationUrl: response.data.data.authorization_url,
          reference: response.data.data.reference,
        };
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      this.logger.error('Paystack initialization failed', error);
      throw new BadRequestException('Paystack payment initialization failed');
    }
  }

  async verifyPayment(reference: string) {
    this.ensureEnabled();
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
        }
      );
      if (response.data.status) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      this.logger.error(`Paystack verification failed for ${reference}`, error);
      throw new BadRequestException('Paystack verification failed');
    }
  }

  async handleWebhook(payload: any, signature: string) {
    if (!this.isEnabled) {
      this.logger.warn('Webhook ignored: Paystack not configured.');
      return null;
    }
    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', this.secretKey!)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (hash !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }
    if (payload.event === 'charge.success') {
      const { reference, amount, metadata } = payload.data;
      return { reference, amount: amount / 100, metadata };
    }
    return null;
  }
}