import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class AirtelMoneyService {
  private readonly logger = new Logger(AirtelMoneyService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private exchangeRateService: ExchangeRateService,
  ) {}

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
    return map[countryCode.toUpperCase()] || 'UGX';
  }

  // Simulate Airtel Money payment request (replace with actual API)
  async requestToPay(data: {
    amount: number;
    currency: string;
    phoneNumber: string;
    externalId: string;
    payerMessage: string;
    payeeNote: string;
  }): Promise<{ referenceId: string }> {
    this.logger.log(`Airtel Money request: ${JSON.stringify(data)}`);
    const referenceId = `AIR_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return { referenceId };
  }

  async getTransactionStatus(referenceId: string): Promise<{ status: string }> {
    this.logger.log(`Checking Airtel Money status for ${referenceId}`);
    const statuses = ['SUCCESSFUL', 'PENDING', 'FAILED'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    return { status: randomStatus };
  }
}