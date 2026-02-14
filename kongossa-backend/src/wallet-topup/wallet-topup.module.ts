import { Module } from '@nestjs/common';
import { WalletTopUpService } from './wallet-topup.service';
import { WalletTopUpController } from './wallet-topup.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';

@Module({
  controllers: [WalletTopUpController],
  providers: [WalletTopUpService, PrismaService, StripeService, PaymentMethodsService],
})
export class WalletTopUpModule {}
