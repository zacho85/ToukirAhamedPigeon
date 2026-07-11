// wallet-topup.module.ts
import { Module } from '@nestjs/common';
import { WalletTopUpService } from './wallet-topup.service';
import { WalletTopUpController } from './wallet-topup.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
import { MomoModule } from '../momo/momo.module';
import { OrangeMoneyModule } from '../orange-money/orange-money.module';
import { ExchangeRateModule } from 'src/exchange-rate/exchange-rate.module';
import { TransfiModule } from '../transfi/transfi.module';
import { MpesaModule } from '../mpesa/mpesa.module'; // ✅ IMPORTANT
import { PaystackModule } from '../paystack/paystack.module';
import { FlutterwaveModule } from '../flutterwave/flutterwave.module';
import { AirtelMoneyModule } from '../airtel-money/airtel-money.module';

@Module({
  imports: [
    MomoModule,
    OrangeMoneyModule,
    ExchangeRateModule,
    TransfiModule,
    MpesaModule,
    PaystackModule,
    FlutterwaveModule,
    AirtelMoneyModule
  ],
  controllers: [WalletTopUpController],
  providers: [WalletTopUpService, PrismaService, StripeService, PaymentMethodsService],
  // Note: No need to export WalletTopUpService unless other modules use it
})
export class WalletTopUpModule {}