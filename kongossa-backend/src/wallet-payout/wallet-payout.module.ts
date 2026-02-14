import { Module } from '@nestjs/common';
import { WalletPayoutService } from './wallet-payout.service';
import { WalletPayoutController } from './wallet-payout.controller';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Module({
  controllers: [WalletPayoutController],
  providers: [WalletPayoutService, PrismaService, StripeService],
})
export class WalletPayoutModule {}
