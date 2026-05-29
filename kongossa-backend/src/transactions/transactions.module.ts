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
/**
 * Transactions module
 * Registers controller, service, and imports PrismaModule
 */
@Module({
  imports: [PrismaModule, StripeModule, PaymentMethodsModule, MomoModule, OrangeMoneyModule, ExchangeRateModule, TransfiModule], // Import PrismaModule for database access
  controllers: [TransactionsController],
  providers: [TransactionsService, WalletTopUpService],
   exports: [TransactionsService],
})
export class TransactionsModule {}
