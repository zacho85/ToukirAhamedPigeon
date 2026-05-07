import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { addDays } from 'date-fns';

@Injectable()
export class PaymentLinksService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentLinksService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secret) throw new Error('STRIPE_SECRET_KEY missing in .env');
    this.stripe = new Stripe(secret, {
      apiVersion: '2025-11-17.clover' as any,
    });
  }

  async createPaymentLink(merchantId: number, dto: CreatePaymentLinkDto) {
    const expiresInDays = dto.expiresInDays || 7;
    const expiresAt = expiresInDays > 0 ? addDays(new Date(), expiresInDays) : null;

    const linkId = this.generateLinkId();
    this.logger.log(`Creating payment link with ID: ${linkId} for merchant: ${merchantId}`);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: (dto.currency || 'USD').toLowerCase(),
            product_data: {
              name: dto.description || 'Payment',
            },
            unit_amount: Math.round(dto.amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: dto.customerEmail,
      success_url: `${this.config.get('FRONTEND_URL')}/payment-link/success?session_id={CHECKOUT_SESSION_ID}&link_id=${linkId}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/payment-link/cancel`,
      metadata: {
        payment_link: 'true',
        link_id: linkId,
        merchant_id: String(merchantId),
      },
    });

    this.logger.log(`Stripe session created: ${session.id}`);

    const paymentLink = await this.prisma.paymentLink.create({
      data: {
        id: linkId,
        merchantId,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        description: dto.description,
        status: 'active',
        expiresAt,
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url,
        customerEmail: dto.customerEmail,
      },
    });

    this.logger.log(`Payment link saved to database: ${paymentLink.id}`);

    return {
      ...paymentLink,
      paymentUrl: `${this.config.get('FRONTEND_URL')}/pay/${paymentLink.id}`,
    };
  }

  private generateLinkId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `pl_${timestamp}${random}`;
  }

  async getMerchantPaymentLinks(merchantId: number) {
    const links = await this.prisma.paymentLink.findMany({
      where: { merchantId },
      orderBy: { createdAt: 'desc' },
    });

    return links.map(link => ({
      ...link,
      paymentUrl: `${this.config.get('FRONTEND_URL')}/pay/${link.id}`,
    }));
  }

  async getPublicPaymentLink(linkId: string) {
    const link = await this.prisma.paymentLink.findUnique({
      where: { id: linkId },
      include: { merchant: { select: { fullName: true, email: true } } },
    });

    if (!link) {
      throw new NotFoundException('Payment link not found');
    }

    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new BadRequestException('This payment link has expired');
    }

    if (link.status === 'paid') {
      throw new BadRequestException('This payment link has already been paid');
    }

    return {
      id: link.id,
      amount: link.amount,
      currency: link.currency,
      description: link.description,
      merchantName: link.merchant.fullName,
      status: link.status,
      stripeCheckoutUrl: link.stripeCheckoutUrl,
    };
  }

  async getPaymentLinkById(linkId: string, merchantId: number) {
    const link = await this.prisma.paymentLink.findFirst({
      where: { id: linkId, merchantId },
    });

    if (!link) {
      throw new NotFoundException('Payment link not found');
    }

    return link;
  }

  /**
   * Mark payment link as paid - called from webhook
   * This is the critical method that credits the wallet
   */
  async markAsPaid(linkId: string, paymentIntentId: string) {
    this.logger.log(`🔵 markAsPaid called for linkId: ${linkId}, paymentIntentId: ${paymentIntentId}`);

    const link = await this.prisma.paymentLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      this.logger.error(`❌ Payment link not found: ${linkId}`);
      return { success: false, message: 'Payment link not found' };
    }

    if (link.status === 'paid') {
      this.logger.warn(`⚠️ Payment link ${linkId} already paid, ignoring duplicate webhook`);
      return { success: true, message: 'Already paid' };
    }

    this.logger.log(`💰 Processing payment: Amount $${link.amount}, Merchant ID: ${link.merchantId}`);

    // Use a transaction to ensure all operations succeed or fail together
    await this.prisma.$transaction(async (tx) => {
      // 1. Update link status
      await tx.paymentLink.update({
        where: { id: linkId },
        data: {
          status: 'paid',
          stripePaymentIntentId: paymentIntentId,
          paymentIntentStatus: 'succeeded',
        },
      });
      this.logger.log(`✅ Payment link ${linkId} status updated to 'paid'`);

      // 2. Get current wallet balance before update
      const merchantBefore = await tx.user.findUnique({
        where: { id: link.merchantId },
        select: { walletBalance: true, fullName: true },
      });
      this.logger.log(`💰 Merchant ${merchantBefore?.fullName} wallet balance before: $${merchantBefore?.walletBalance}`);

      // 3. Credit merchant's wallet
      await tx.user.update({
        where: { id: link.merchantId },
        data: { walletBalance: { increment: link.amount } },
      });

      // 4. Get updated wallet balance
      const merchantAfter = await tx.user.findUnique({
        where: { id: link.merchantId },
        select: { walletBalance: true },
      });
      this.logger.log(`💰 Merchant wallet balance after: $${merchantAfter?.walletBalance}`);

      // 5. Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          transactionId: `paylink_${linkId}_${Date.now()}`,
          senderId: link.merchantId,
          amount: link.amount,
          currency: link.currency,
          type: 'payment_link',
          status: 'completed',
          paymentMethod: 'stripe',
          description: `Payment received via link: ${link.description || 'Payment'}`,
        },
      });
      this.logger.log(`✅ Transaction created: ${transaction.transactionId}`);
    });

    this.logger.log(`🎉 Payment link ${linkId} successfully processed!`);
    return { success: true, message: 'Payment link marked as paid' };
  }

  async cancelPaymentLink(linkId: string, merchantId: number) {
    const link = await this.prisma.paymentLink.findFirst({
      where: { id: linkId, merchantId, status: 'active' },
    });

    if (!link) {
      throw new NotFoundException('Active payment link not found');
    }

    return this.prisma.paymentLink.update({
      where: { id: linkId },
      data: { status: 'cancelled' },
    });
  }
}