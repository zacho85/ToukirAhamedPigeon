import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WalletTopUpService } from 'src/wallet-topup/wallet-topup.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { PaymentMethodsModule } from 'src/payment-methods/payment-methods.module';

/**
 * Transactions module
 * Registers controller, service, and imports PrismaModule
 */
@Module({
  imports: [PrismaModule, StripeModule, PaymentMethodsModule], // Import PrismaModule for database access
  controllers: [TransactionsController],
  providers: [TransactionsService, WalletTopUpService],
})
export class TransactionsModule {}
