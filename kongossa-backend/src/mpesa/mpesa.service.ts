import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  getCurrencyFromCountry(countryCode: string): string {
    const map: Record<string, string> = {
      KE: 'KES',
      TZ: 'TZS',
      UG: 'UGX',
      RW: 'RWF',
      CD: 'CDF',
      ZM: 'ZMW',
    };
    return map[countryCode.toUpperCase()] || 'KES';
  }

  // Simulate M-Pesa payment request (replace with actual API)
  async requestToPay(data: {
    amount: number;
    currency: string;
    phoneNumber: string;
    externalId: string;
    payerMessage: string;
    payeeNote: string;
  }): Promise<{ referenceId: string }> {
    this.logger.log(`M-Pesa request: ${JSON.stringify(data)}`);
    const referenceId = `MPESA_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return { referenceId };
  }

  async getTransactionStatus(referenceId: string): Promise<{ status: string }> {
    this.logger.log(`Checking M-Pesa status for ${referenceId}`);
    // Simulate statuses – replace with real API call
    const statuses = ['SUCCESSFUL', 'PENDING', 'FAILED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return { status: randomStatus };
  }
}