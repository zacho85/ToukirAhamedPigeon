import { Module } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { ConfigModule } from '@nestjs/config';

// No controller here — the real webhook lives on WalletTopUpController
// (POST wallet-topup/mpesa/webhook), matching the Orange Money / Transfi
// pattern. This module exists purely to provide MpesaService.
@Module({
  imports: [ConfigModule],
  providers: [MpesaService],
  exports: [MpesaService],
})
export class MpesaModule {}
