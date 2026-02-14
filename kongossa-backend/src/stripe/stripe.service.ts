import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secret) throw new Error('STRIPE_SECRET_KEY missing in .env');

    this.stripe = new Stripe(secret, {
      apiVersion: '2025-10-29.clover',
    });
  }

  get client(): Stripe {
    return this.stripe;
  }

  async createCheckoutSession(dto: {
    amount: number;
    currency?: string;
    description?: string;
    metadata?: Record<string, string>;
  }) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: dto.currency ?? 'usd',
              product_data: {
                name: dto.description || 'Payment',
              },
              unit_amount: Math.round(dto.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${this.config.get('FRONTEND_URL')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.config.get('FRONTEND_URL')}/payment/cancel`,
        metadata: dto.metadata || {},
      });

      return { url: session.url, id: session.id };
    } catch (error: any) {
      this.logger.error(`Checkout creation failed: ${error.message}`);
      throw new BadRequestException('Checkout session creation failed');
    }
  }

  async verifyCheckoutSession(sessionId: string) {
    if (!sessionId) throw new BadRequestException('Session ID is required');
    return this.stripe.checkout.sessions.retrieve(sessionId);
  }

  async handleWebhook(sig: string, body: Buffer) {
    let event: Stripe.Event;
    console.log('Webhook received:', sig, body);
    try {
      const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET missing');

      event = this.stripe.webhooks.constructEvent(body, sig, secret);
    } catch (err: any) {
      this.logger.error('Webhook signature invalid', err);
      throw new BadRequestException(`Invalid webhook signature`);
    }

    this.logger.log(`Stripe event received → ${event.type}`);

    console.log(event.type);
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (!intent.metadata?.wallet_topup_user_id) break;
        await this.processWalletTopupFromIntent(intent);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.metadata?.tontine_id) await this.handleTontinePayment(session);
        if (session.metadata?.subscription) await this.handleSubscriptionPayment(session);
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;

        await this.prisma.walletPayout.updateMany({
            where: { stripePayoutId: payout.id },
            data: { status: 'completed' },
        });

        break;
        }
        case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;

        await this.prisma.walletPayout.updateMany({
            where: { stripePayoutId: payout.id },
            data: {
            status: 'failed',
            failureReason: payout.failure_message || 'Unknown',
            },
        });

        break;
        }
        case 'account.updated': {
            const account = event.data.object as Stripe.Account;

            await this.prisma.user.updateMany({
                where: { stripeConnectId: account.id },
                data: {
                stripeChargesEnabled: account.charges_enabled,
                stripePayoutsEnabled: account.payouts_enabled,
                stripeDetailsSubmitted: account.details_submitted,
                },
            });

            this.logger.log(
                `Connect account updated → ${account.id} | payouts: ${account.payouts_enabled}`
            );
            break;
            }

            case 'account.application.authorized': {
            this.logger.log(
                `Platform authorized for account ${event.account}`
            );
            break;
            }
      default:
        this.logger.warn(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  // ------------------- WALLET TOPUP -------------------
  private async processWalletTopupFromIntent(intent: Stripe.PaymentIntent) {
    console.log(intent);
    const userId = Number(intent.metadata.wallet_topup_user_id);
    const amount = intent.amount_received / 100;
    const intentId = intent.id;
    const chargeId = intent.latest_charge as string | null;

    try {
      // 1️⃣ Find topup
      const topup = await this.prisma.walletTopUp.findUnique({
        where: { stripeIntentId: intentId },
      });

      if (!topup) {
        this.logger.warn(`Topup not found for intent ${intentId}`);
        return;
      }

      if (topup.status === 'succeeded') {
        this.logger.warn(`Topup already processed → ${intentId}`);
        return;
      }

      // 2️⃣ Run all DB updates in a real transaction
      await this.prisma.$transaction([
        // Update wallet topup
        this.prisma.walletTopUp.update({
          where: { id: topup.id },
          data: { status: 'succeeded', stripeChargeId: chargeId },
        }),

        // Increment wallet balance
        this.prisma.user.update({
          where: { id: userId },
          data: { walletBalance: { increment: amount } },
        }),

        // Create transaction if not exists
        this.prisma.transaction.upsert({
          where: { transactionId: intentId },
          update: {}, // already processed, do nothing
          create: {
            transactionId: intentId,
            senderId: userId,
            amount,
            currency: topup.currency,
            type: 'wallet_topup',
            status: 'completed',
            paymentMethod: 'stripe',
            description: ' Wallet topup via Stripe. ' + (intent.metadata.remarks || ''),
          },
        }),
      ]);

      this.logger.log(`Wallet topup SUCCESS → user ${userId}, amount ${amount}`);
    } catch (err: any) {
      this.logger.error('Error processing wallet topup', err);
      throw new BadRequestException('Wallet topup failed');
    }
  }

  // ------------------- TONTINE -------------------
  private async handleTontinePayment(session: Stripe.Checkout.Session) {
    const tontineId = Number(session.metadata?.tontine_id ?? 0);
    const userId = Number(session.metadata?.user_id ?? 0);
    const amount = (session.amount_total ?? 0) / 100;

    const tontine = await this.prisma.tontine.findUnique({
      where: { id: tontineId },
      include: { members: true },
    });

    if (!tontine) throw new BadRequestException('Tontine not found');

    const member = tontine.members.find(m => m.userId === userId);
    if (!member) throw new BadRequestException('User not in tontine');

    await this.prisma.$transaction([
      this.prisma.tontineContribution.create({
        data: {
          tontineMemberId: member.id,
          userId,
          amount,
          status: 'paid',
          contributionDate: new Date(),
        },
      }),
      this.prisma.tontine.update({
        where: { id: tontineId },
        data: {
          totalPot: Number((tontine.totalPot as any)?.toNumber?.() ?? tontine.totalPot ?? 0) + amount,
        },
      }),
    ]);

    this.logger.log(`Tontine payment recorded → tontine ${tontineId}`);
  }

  // ------------------- SUBSCRIPTION -------------------
  private async handleSubscriptionPayment(_: Stripe.Checkout.Session) {
    this.logger.log('Subscription payment handler not implemented yet');
  }

  async createConnectAccount(userId: number) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new BadRequestException('User not found');

  // Prevent duplicate account
  if (user.stripeConnectId) {
    return { accountId: user.stripeConnectId };
  }

  const account = await this.stripe.accounts.create({
    type: 'express',
    country: user.country || 'FR',
    email: user.email,
    business_type: user.accountType === 'business' ? 'company' : 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      user_id: String(user.id),
    },
  });

  await this.prisma.user.update({
    where: { id: userId },
    data: { stripeConnectId: account.id },
  });

  return { accountId: account.id };
}
async createOnboardingLink(userId: number) {
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user?.stripeConnectId)
    throw new BadRequestException('Connect account not created');

  const link = await this.stripe.accountLinks.create({
    account: user.stripeConnectId,
    refresh_url: `${this.config.get('FRONTEND_URL')}/stripe/onboarding/refresh`,
    return_url: `${this.config.get('FRONTEND_URL')}/stripe/onboarding/success`,
    type: 'account_onboarding',
  });

  return { url: link.url };
}


}
