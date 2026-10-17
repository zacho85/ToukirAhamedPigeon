import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';
import { FeesService } from '../fees/fees.service';

@Injectable()
export class WalletPayoutService {
  private logger = new Logger(WalletPayoutService.name);

  constructor(
    private prisma: PrismaService,
    private stripe: StripeService,
    private fees: FeesService,
  ) {}

  /* =====================================================
     USER REQUEST PAYOUT
     The withdrawal fee (Fee Management) is paid on top: the user receives
     the full amount and the wallet is debited amount + fee. The fee reaches
     the platform account only when the Stripe payout succeeds; a failed
     payout refunds amount + fee and the platform is never touched.
     WalletPayout.amount = debited from the wallet, netAmount = paid out.
  ====================================================== */
  async requestPayout(userId: number, amount: number) {
    try {
      amount = Math.round(amount * 100) / 100;
      if (!(amount > 0)) throw new BadRequestException('Invalid amount');

      // Load user
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');
      // Checked before any debit, so a payout can never be left pending with the money taken.
      if (!user.stripeConnectId) throw new BadRequestException('User not connected to Stripe');

      const fee = await this.fees.withdrawalFee(amount);
      const total = Math.round((amount + fee) * 100) / 100;

      // Create payout + deduct balance, only if the balance still covers amount + fee
      const payout = await this.prisma.$transaction(async (tx) => {
        const debited = await tx.user.updateMany({
          where: { id: userId, walletBalance: { gte: total } },
          data: { walletBalance: { decrement: total } },
        });
        if (debited.count === 0) throw new BadRequestException('Insufficient balance');

        return tx.walletPayout.create({
          data: {
            userId,
            amount: total,
            fee,
            netAmount: amount,
            currency: user.currency,
            status: 'pending',
          },
        });
      });

      // Process payout
      await this.processPayout(payout.id);

      return { payoutId: payout.id, amount, fee, total };
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
    if (!user) return;

    // Only a failed Stripe call refunds: once Stripe has paid out, the money has left.
    let stripePayout: Stripe.Payout;
    try {
        if (!user.stripeConnectId) throw new BadRequestException('User not connected to Stripe');

        // 1️⃣ Mark as processing
        await this.prisma.walletPayout.update({
        where: { id: payout.id },
        data: { status: 'processing' },
        });

        // 2️⃣ Stripe payout
        stripePayout = await this.stripe.client.payouts.create(
        {
            amount: Math.round(payout.netAmount * 100),
            currency: payout.currency.toLowerCase(),
        },
        {
            stripeAccount: user.stripeConnectId,
        }
        );
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

    // 3️⃣ Mark payout success, ledger row for the payout and the fee to the platform
    await this.prisma.$transaction(async (tx) => {
        await tx.walletPayout.update({
            where: { id: payout.id },
            data: {
            status: 'completed',
            stripePayoutId: stripePayout.id,
            },
        });

        await tx.transaction.create({
            data: {
            transactionId: stripePayout.id,
            senderId: payout.userId,
            amount: payout.netAmount,
            fee: payout.fee,
            currency: payout.currency,
            type: 'wallet_payout',
            status: 'completed',
            paymentMethod: 'stripe',
            description: 'Wallet payout via Stripe',
            },
        });

        await this.fees.recordFee(tx, {
            payerId: payout.userId,
            fee: payout.fee,
            reference: stripePayout.id,
            description: 'Withdrawal fee',
        });
    });
  }
}
