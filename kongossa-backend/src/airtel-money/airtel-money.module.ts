import { Module } from '@nestjs/common';
import { AirtelMoneyService } from './airtel-money.service';
import { AirtelMoneyController } from './airtel-money.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module';

@Module({
  imports: [ExchangeRateModule],
  providers: [AirtelMoneyService, PrismaService, ConfigService],
  controllers: [AirtelMoneyController],
  exports: [AirtelMoneyService],
})
export class AirtelMoneyModule {}