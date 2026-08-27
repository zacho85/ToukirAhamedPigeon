import { Module } from '@nestjs/common';
import { AirtelMoneyService } from './airtel-money.service';
import { ConfigModule } from '@nestjs/config';

// No controller here — the real webhook lives on WalletTopUpController
// (POST wallet-topup/airtel/webhook), matching the Orange Money / Transfi
// pattern. This module exists purely to provide AirtelMoneyService.
@Module({
  imports: [ConfigModule],
  providers: [AirtelMoneyService],
  exports: [AirtelMoneyService],
})
export class AirtelMoneyModule {}
