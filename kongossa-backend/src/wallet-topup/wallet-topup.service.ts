// wallet-topup.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { randomUUID } from 'crypto';
import { toNumber } from 'src/common/utils/decimal.util';
import { PaymentMethodsService } from 'src/payment-methods/payment-methods.service';

@Injectable()
export class WalletTopUpService {
  constructor(private prisma: PrismaService, private stripe: StripeService, private paymentMethods: PaymentMethodsService) {}

  /**
   * Create a Stripe topup intent
   */
  async createTopUpIntent(
    userId: number,
    amount: number,
    paymentMethodId: string,
    remarks?: string,
    ) {
    if (amount <= 0) {
        throw new BadRequestException('Invalid amount');
    }

    const user = await this.prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new BadRequestException('User not found');
    }

    // ✅ Always ensure customer exists in CURRENT Stripe account
    const customerId = await this.paymentMethods.getOrCreateCustomer(userId);

    const intent = await this.stripe.client.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: user.currency.toLowerCase(),

        customer: customerId,

        // ✅ attached & already saved payment method
        payment_method: paymentMethodId,

        // ✅ frontend confirms
        confirm: false,

        metadata: {
        wallet_topup_user_id: String(userId),
        purpose: 'wallet_topup',
        remarks: remarks || '',
        },
    });

    await this.prisma.walletTopUp.create({
        data: {
        userId,
        amount,
        currency: user.currency,
        stripeIntentId: intent.id,
        paymentMethodId,
        status: 'pending',
        },
    });

    return {
        clientSecret: intent.client_secret,
    };
 }

  /**
   * Compute wallet balance from transactions table
   * Always the source of truth
   */
  async computeWalletBalance(userId: number, currency?: string) {

    const moneyInTopUpAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: {
        senderId: userId,
        status: 'completed',
        type: 'wallet_topup',
        ...(currency ? { currency } : {}),
      },
    });

    const moneyInAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: {
        recipientId: userId,
        status: 'completed',
        ...(currency ? { currency } : {}),
      },
    });

    const moneyOutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: {
        senderId: userId,
        status: 'completed',
        NOT: { type: 'wallet_topup' },
        ...(currency ? { currency } : {}),
      },
    });

    const moneyInTopUp = (moneyInTopUpAgg._sum.amount || 0);
    const moneyIn = moneyInAgg._sum.amount || 0;
    const moneyOut = toNumber(moneyOutAgg._sum.amount || 0) + toNumber(moneyOutAgg._sum.fee || 0);

    return toNumber(moneyInTopUp) + toNumber(moneyIn) - toNumber(moneyOut);
  }

  /**
   * Get monthly money in/out stats
   */
  async getMonthlyStats(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const moneyInAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: { recipientId: userId, status: 'completed', createdAt: { gte: startOfMonth, lte: endOfMonth } },
    });

    const moneyOutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true, fee: true },
      where: { senderId: userId, status: 'completed', NOT: { type: 'wallet_topup' }, createdAt: { gte: startOfMonth, lte: endOfMonth } },
    });

    const moneyIn = toNumber(moneyInAgg._sum.amount || 0);
    const moneyOut = toNumber(moneyOutAgg._sum.amount || 0) + toNumber(moneyOutAgg._sum.fee || 0);

    return { moneyIn, moneyOut, net: toNumber(moneyIn) - toNumber(moneyOut) };
  }

  async getPlatformStats() {
    // 💰 Total Top Up
    const topUpAgg = await this.prisma.walletTopUp.aggregate({
      _sum: { amount: true },
      where: { status: 'succeeded' },
    });

    // 📤 Total Payout (money sent out by platform)
    const payoutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: 'completed',
        type: 'payout', // adjust if you use another type
      },
    });

    // 💸 Transaction Fees Collected
    const feeAgg = await this.prisma.transaction.aggregate({
      _sum: { fee: true },
      where: { status: 'completed' },
    });

    // 🧾 Fee payouts (if fees are withdrawn separately)
    const feePayoutAgg = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        status: 'completed',
        type: 'fee_payout',
      },
    });

    const totalTopUp = topUpAgg._sum.amount || 0;
    const totalPayout = payoutAgg._sum.amount || 0;
    const totalFee = feeAgg._sum.fee || 0;
    const feePayout = feePayoutAgg._sum.amount || 0;

    return {
      platformBalance: toNumber(totalTopUp) - toNumber(totalPayout),

      totalTopUp,
      totalPayout,

      totalTransactionFee: totalFee,
      totalFeePayout: feePayout,
      totalFeeBalance: toNumber(totalFee) - toNumber(feePayout),
    };
  }
}
