import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

/** The platform account created by the platform_fees migration. */
export const PLATFORM_ACCOUNT_EMAIL = 'platform@kongossapay.system';

export type FeeSettings = {
  depositFeePercent: number;
  withdrawalFeePercent: number;
  p2pFeePercent: number;
  p2pFreeDailyAmount: number;
  mobileMoneyFeePercent: number;
};

/** Used until an admin saves fee settings for the first time. */
const DEFAULT_FEES: FeeSettings = {
  depositFeePercent: 0,
  withdrawalFeePercent: 0.5,
  p2pFeePercent: 0.5,
  p2pFreeDailyAmount: 13,
  mobileMoneyFeePercent: 1.5,
};

type Tx = Prisma.TransactionClient;

/**
 * Platform fees and agent commission.
 *
 * Every fee is a ledger movement from the customer to the platform account,
 * and every agent commission is a movement from the platform account to the
 * agent, so the platform's balance is fees earned minus commission paid. The
 * platform balance may go below zero (cash in has no fee but pays commission).
 * All rates are read from the latest SystemSettings row on each request.
 */
@Injectable()
export class FeesService {
  private platformUserId: number | null = null;

  constructor(private prisma: PrismaService) {}

  private money(value: number): number {
    return Math.round(value * 100) / 100;
  }

  async getSettings(): Promise<FeeSettings> {
    const latest = await this.prisma.systemSettings.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!latest) return { ...DEFAULT_FEES };
    return {
      depositFeePercent: latest.depositFeePercent,
      withdrawalFeePercent: latest.withdrawalFeePercent,
      p2pFeePercent: latest.p2pFeePercent,
      p2pFreeDailyAmount: latest.p2pFreeDailyAmount,
      mobileMoneyFeePercent: latest.mobileMoneyFeePercent,
    };
  }

  async getPlatformUserId(): Promise<number> {
    if (this.platformUserId) return this.platformUserId;
    const platform = await this.prisma.user.findUnique({
      where: { email: PLATFORM_ACCOUNT_EMAIL },
      select: { id: true },
    });
    if (!platform) {
      throw new InternalServerErrorException('Platform account missing: run the database migrations');
    }
    this.platformUserId = platform.id;
    return platform.id;
  }

  async getPlatformBalance() {
    const id = await this.getPlatformUserId();
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id }, select: { walletBalance: true } });
    return { balance: this.money(user.walletBalance) };
  }

  async depositFee(amount: number) {
    const { depositFeePercent } = await this.getSettings();
    return this.money((amount * depositFeePercent) / 100);
  }

  async withdrawalFee(amount: number) {
    const { withdrawalFeePercent } = await this.getSettings();
    return this.money((amount * withdrawalFeePercent) / 100);
  }

  /** Completed transfers this sender made today (server time) that count toward the free amount. */
  private async sentToday(senderId: number) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const sum = await this.prisma.transaction.aggregate({
      where: {
        senderId,
        status: 'completed',
        createdAt: { gte: dayStart },
        OR: [{ type: 'agent_transfer' }, { type: 'wallet_transfer', paymentMethod: 'send_money' }],
      },
      _sum: { amount: true },
    });
    return Number(sum._sum.amount || 0);
  }

  /**
   * Fee for sending money to another KongossaPay user: free up to the daily
   * amount per sender, then the percentage on the part above it.
   */
  async transferFee(senderId: number, amount: number) {
    const { p2pFeePercent, p2pFreeDailyAmount } = await this.getSettings();
    const freeLeft = Math.max(0, p2pFreeDailyAmount - (await this.sentToday(senderId)));
    const charged = Math.max(0, amount - freeLeft);
    return {
      fee: this.money((charged * p2pFeePercent) / 100),
      freeLeft: this.money(freeLeft),
      freeDailyAmount: p2pFreeDailyAmount,
      percent: p2pFeePercent,
    };
  }

  /** Moves a fee from the payer to the platform. Run inside the caller's transaction, after the debit. */
  async recordFee(tx: Tx, p: { payerId: number; fee: number; reference: string; description: string }) {
    if (p.fee <= 0) return;
    const platformId = await this.getPlatformUserId();
    await tx.user.update({ where: { id: platformId }, data: { walletBalance: { increment: p.fee } } });
    await tx.transaction.create({
      data: {
        transactionId: `${p.reference}-FEE`,
        senderId: p.payerId,
        recipientId: platformId,
        amount: p.fee,
        currency: 'USD',
        type: 'platform_fee',
        status: 'completed',
        paymentMethod: 'platform_fee',
        referenceNumber: p.reference,
        description: p.description,
      },
    });
  }

  /** Pays an agent's commission out of the platform account. Run inside the caller's transaction. */
  async payCommission(tx: Tx, p: { agentUserId: number; commission: number; reference: string; description: string }) {
    if (p.commission <= 0) return;
    const platformId = await this.getPlatformUserId();
    await tx.user.update({ where: { id: platformId }, data: { walletBalance: { decrement: p.commission } } });
    await tx.user.update({ where: { id: p.agentUserId }, data: { walletBalance: { increment: p.commission } } });
    await tx.transaction.create({
      data: {
        transactionId: `${p.reference}-COM`,
        senderId: platformId,
        recipientId: p.agentUserId,
        amount: p.commission,
        currency: 'USD',
        type: 'agent_commission',
        status: 'completed',
        paymentMethod: 'agent_commission',
        referenceNumber: p.reference,
        description: p.description,
      },
    });
  }
}
