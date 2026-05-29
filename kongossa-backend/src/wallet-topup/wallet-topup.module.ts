import { Module } from '@nestjs/common';
import { WalletTopUpService } from './wallet-topup.service';
import { WalletTopUpController } from './wallet-topup.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';
// ✅ ADD: Mobile money module imports
import { MomoModule } from '../momo/momo.module';
import { OrangeMoneyModule } from '../orange-money/orange-money.module';
import { ExchangeRateModule } from 'src/exchange-rate/exchange-rate.module';
import { TransfiModule } from '../transfi/transfi.module';

@Module({
  imports: [MomoModule, OrangeMoneyModule, ExchangeRateModule, TransfiModule],
  controllers: [WalletTopUpController],
  providers: [WalletTopUpService, PrismaService, StripeService, PaymentMethodsService],
})
export class WalletTopUpModule {}