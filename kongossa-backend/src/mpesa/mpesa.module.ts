import { Module } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module'; // ✅ Import

@Module({
  imports: [ExchangeRateModule], // ✅ Add this
  providers: [MpesaService, PrismaService, ConfigService],
  controllers: [MpesaController],
  exports: [MpesaService],
})
export class MpesaModule {}