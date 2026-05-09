// payment-links.service.ts
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
    this.logger.log(`Creating payment link with ID: ${linkId} for merchant: ${merchantId}, Type: ${dto.type}`);

    let session: Stripe.Checkout.Session;
    let lineItems: any[] = [];

    // Build line items based on payment link type
    if (dto.type === 'fixed_amount') {
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Payment' },
          unit_amount: Math.round((dto.amount || 0) * 100),
        },
        quantity: 1,
      }];
    } else if (dto.type === 'flexible_amount') {
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Payment' },
          unit_amount: 100, // Placeholder
        },
        quantity: 1,
      }];
    } else if (dto.type === 'quantity_limited') {
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Payment' },
          unit_amount: Math.round((dto.amount || 0) * 100),
        },
        quantity: dto.quantity || 1,
      }];
    } else {
      // subscription type
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Subscription' },
          unit_amount: Math.round((dto.amount || 0) * 100),
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }];
    }

    const sessionConfig: any = {
      payment_method_types: ['card'],
      mode: dto.type === 'subscription' ? 'subscription' : 'payment',
      line_items: lineItems,
      customer_email: dto.customerEmail,
      success_url: `${this.config.get('FRONTEND_URL')}/payment-link/success?session_id={CHECKOUT_SESSION_ID}&link_id=${linkId}`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/payment-link/cancel`,
      metadata: {
        payment_link: 'true',
        link_id: linkId,
        merchant_id: String(merchantId),
        link_type: dto.type,
      },
    };

    if (dto.type === 'flexible_amount') {
      sessionConfig.mode = 'payment';
    }

    session = await this.stripe.checkout.sessions.create(sessionConfig);
    this.logger.log(`Stripe session created: ${session.id}`);

    const paymentLink = await this.prisma.paymentLink.create({
      data: {
        id: linkId,
        merchantId,
        type: dto.type,
        amount: dto.amount || null,
        currency: dto.currency || 'USD',
        description: dto.description,
        status: 'active',
        expiresAt,
        quantityTotal: dto.quantity || null,
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url,
        customerEmail: dto.customerEmail,
      },
    });

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

    if (link.type === 'quantity_limited' && link.quantityTotal && link.quantityUsed >= link.quantityTotal) {
      throw new BadRequestException('This payment link has reached its usage limit');
    }

    // For non-quantity links, check if paid
    if (link.type !== 'quantity_limited' && link.status === 'paid') {
      throw new BadRequestException('This payment link has already been paid');
    }

    // For partially paid quantity links, still show as active
    const status = link.type === 'quantity_limited' && link.status === 'partially_paid' ? 'active' : link.status;

    return {
      id: link.id,
      type: link.type,
      amount: link.amount,
      currency: link.currency,
      description: link.description,
      merchantName: link.merchant.fullName,
      status: status,
      stripeCheckoutUrl: link.stripeCheckoutUrl,
      quantityRemaining: link.type === 'quantity_limited' && link.quantityTotal 
        ? link.quantityTotal - link.quantityUsed 
        : undefined,
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

  async markAsPaid(linkId: string, paymentIntentId: string) {
    this.logger.log(`🔵 markAsPaid called for linkId: ${linkId}, paymentIntentId: ${paymentIntentId}`);

    const link = await this.prisma.paymentLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      this.logger.error(`❌ Payment link not found: ${linkId}`);
      return { success: false, message: 'Payment link not found' };
    }

    // Handle quantity limited payment links
    if (link.type === 'quantity_limited') {
      const newQuantityUsed = (link.quantityUsed || 0) + 1;
      const quantityTotal = link.quantityTotal || 1;
      const newStatus = newQuantityUsed >= quantityTotal ? 'paid' : 'partially_paid';

      this.logger.log(`📊 Quantity limited: ${newQuantityUsed}/${quantityTotal}, new status: ${newStatus}`);

      await this.prisma.$transaction(async (tx) => {
        await tx.paymentLink.update({
          where: { id: linkId },
          data: {
            quantityUsed: newQuantityUsed,
            status: newStatus,
            stripePaymentIntentId: paymentIntentId,
            paymentIntentStatus: 'succeeded',
          },
        });

        await tx.user.update({
          where: { id: link.merchantId },
          data: { walletBalance: { increment: link.amount || 0 } },
        });

        await tx.transaction.create({
          data: {
            transactionId: `paylink_${linkId}_${Date.now()}`,
            senderId: undefined,
            recipientId: link.merchantId,
            amount: link.amount || 0,
            currency: link.currency,
            type: 'payment_link',
            status: 'completed',
            paymentMethod: 'stripe',
            description: `Payment received via link: ${link.description || 'Payment'} (${newQuantityUsed}/${quantityTotal})`,
          },
        });
      });

      const updatedMerchant = await this.prisma.user.findUnique({
        where: { id: link.merchantId },
        select: { walletBalance: true },
      });

      return { 
        success: true, 
        message: `Payment ${newQuantityUsed}/${quantityTotal} completed`,
        updatedBalance: updatedMerchant?.walletBalance,
      };
    }

    // Handle single payment links (fixed_amount, flexible_amount, subscription)
    if (link.status === 'paid') {
      this.logger.warn(`⚠️ Payment link ${linkId} already paid`);
      return { success: true, message: 'Already paid' };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.paymentLink.update({
        where: { id: linkId },
        data: {
          status: 'paid',
          stripePaymentIntentId: paymentIntentId,
          paymentIntentStatus: 'succeeded',
        },
      });

      await tx.user.update({
        where: { id: link.merchantId },
        data: { walletBalance: { increment: link.amount || 0 } },
      });

      await tx.transaction.create({
        data: {
          transactionId: `paylink_${linkId}_${Date.now()}`,
          senderId: undefined,
          recipientId: link.merchantId,
          amount: link.amount || 0,
          currency: link.currency,
          type: 'payment_link',
          status: 'completed',
          paymentMethod: 'stripe',
          description: `Payment received via link: ${link.description || 'Payment'}`,
        },
      });
    });

    const updatedMerchant = await this.prisma.user.findUnique({
      where: { id: link.merchantId },
      select: { walletBalance: true },
    });

    return {
      success: true,
      message: 'Payment link marked as paid',
      updatedBalance: updatedMerchant?.walletBalance,
    };
  }

  async cancelPaymentLink(linkId: string, merchantId: number) {
    const link = await this.prisma.paymentLink.findFirst({
      where: { id: linkId, merchantId, status: { in: ['active', 'partially_paid'] } },
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