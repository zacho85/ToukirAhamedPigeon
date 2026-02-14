import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';

@Injectable()
export class WalletPayoutService {
  private logger = new Logger(WalletPayoutService.name);

  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
  ) {}

  /* =====================================================
     USER REQUEST PAYOUT
  ====================================================== */
  async requestPayout(userId: number, amount: number) {
    try {
      if (amount <= 0) throw new BadRequestException('Invalid amount');

      // Load user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');

      // Check pending payouts
      const pending = await this.prisma.walletPayout.aggregate({
        _sum: { netAmount: true },
        where: { userId, status: { in: ['pending', 'processing'] } },
      });

      const lockedAmount = pending._sum.netAmount || 0;
      const availableBalance = user.walletBalance - lockedAmount;

      if (availableBalance < amount)
        throw new BadRequestException('Balance already reserved for another payout');

      // Fee
      const fee = 1;
      const netAmount = amount - fee;
      if (netAmount <= 0) throw new BadRequestException('Amount too small');

      // Create payout + deduct balance
      const payout = await this.prisma.$transaction(async (tx) => {
        const p = await tx.walletPayout.create({
          data: {
            userId,
            amount,
            fee,
            netAmount,
            currency: user.currency,
            status: 'pending',
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: amount } },
        });

        return p;
      });

      // Process payout
      await this.processPayout(payout.id);

      return { payoutId: payout.id };
    } catch (err: any) {
      this.logger.error('Payout request failed', err);
      throw new BadRequestException(err.message);
    }
  }

  /* =====================================================
     PROCESS PAYOUT
  ====================================================== */
  async processPayout(payoutId: number) {
    const payout = await this.prisma.walletPayout.findUnique({ where: { id: payoutId } });
    if (!payout) return;
    if (payout.status !== 'pending') return;

    // Load user
    const user = await this.prisma.user.findUnique({ where: { id: payout.userId } });
    if (!user?.stripeConnectId) throw new BadRequestException('User not connected to Stripe');

    try {
        // 1️⃣ Mark as processing
        await this.prisma.walletPayout.update({
        where: { id: payout.id },
        data: { status: 'processing' },
        });

        // 2️⃣ Stripe payout
        const stripePayout = await this.stripe.client.payouts.create(
        {
            amount: Math.round(payout.netAmount * 100),
            currency: payout.currency.toLowerCase(),
        },
        {
            stripeAccount: user.stripeConnectId,
        }
        );

        // 3️⃣ Mark payout success + create transaction
        await this.prisma.$transaction([
        // Update payout
        this.prisma.walletPayout.update({
            where: { id: payout.id },
            data: {
            status: 'completed',
            stripePayoutId: stripePayout.id,
            },
        }),

        // Create transaction entry
        this.prisma.transaction.create({
            data: {
            transactionId: stripePayout.id,
            senderId: payout.userId,
            amount: payout.amount,
            fee: payout.fee,
            currency: payout.currency,
            type: 'wallet_payout',
            status: 'completed',
            paymentMethod: 'stripe',
            description: 'Wallet payout via Stripe',
            },
        }),
        ]);
    } catch (err: any) {
        // Refund and mark failed
        await this.prisma.$transaction([
        this.prisma.walletPayout.update({
            where: { id: payout.id },
            data: { status: 'failed', failureReason: err.message },
        }),
        this.prisma.user.update({
            where: { id: payout.userId },
            data: { walletBalance: { increment: payout.amount } },
        }),
        ]);

        this.logger.error('Payout processing failed', err);
        throw err;
    }
    }
}
