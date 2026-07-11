// transactions.module.ts
import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletTopUpService } from 'src/wallet-topup/wallet-topup.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';
import { MomoModule } from 'src/momo/momo.module';
import { OrangeMoneyModule } from 'src/orange-money/orange-money.module';
import { ExchangeRateModule } from 'src/exchange-rate/exchange-rate.module';
import { TransfiModule } from '../transfi/transfi.module';
import { MpesaModule } from '../mpesa/mpesa.module';
import { PaystackModule } from '../paystack/paystack.module';      // ✅ ADDED
import { FlutterwaveModule } from '../flutterwave/flutterwave.module'; // ✅ ADDED
import { AirtelMoneyModule } from '../airtel-money/airtel-money.module';

@Module({
  imports: [
    PrismaModule,
    StripeModule,
    PaymentMethodsModule,
    MomoModule,
    OrangeMoneyModule,
    ExchangeRateModule,
    TransfiModule,
    MpesaModule,
    PaystackModule,      // ✅ ADDED
    FlutterwaveModule,   // ✅ ADDED
    AirtelMoneyModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, WalletTopUpService],
  exports: [TransactionsService],
})
export class TransactionsModule {}