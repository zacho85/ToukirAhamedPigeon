// payment-links.service.ts - FULL UPDATED VERSION
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

  // Helper: Convert frequency to Stripe interval
  private getStripeInterval(frequency: string, customDays?: number): { interval: Stripe.Price.Recurring.Interval; intervalCount?: number } {
    switch (frequency) {
      case 'daily':
        return { interval: 'day', intervalCount: 1 };
      case 'weekly':
        return { interval: 'week', intervalCount: 1 };
      case 'bi_monthly':
        return { interval: 'month', intervalCount: 1 }; // Use 1 month for bi-monthly
      case 'monthly':
        return { interval: 'month', intervalCount: 1 };
      case 'quarterly':
        return { interval: 'month', intervalCount: 3 };
      case 'semiannual':
        return { interval: 'month', intervalCount: 6 };
      case 'annual':
        return { interval: 'year', intervalCount: 1 };
      case 'custom':
        return { interval: 'day', intervalCount: customDays || 30 };
      default:
        return { interval: 'month', intervalCount: 1 };
    }
  }

  // Helper: Determine subscription end behavior
  private getSubscriptionEndDate(
    durationType: string,
    durationMonths?: number,
    totalPayments?: number,
    endDate?: Date,
  ): Date | null {
    const now = new Date();
    
    switch (durationType) {
      case 'fixed_term':
        if (durationMonths) {
          const end = new Date(now);
          end.setMonth(end.getMonth() + durationMonths);
          return end;
        }
        return null;
      case 'fixed_payments':
        // For fixed payments, we don't set an end date in Stripe
        // We'll handle payment counting manually
        return null;
      case 'end_date':
        return endDate || null;
      case 'recurring':
      default:
        return null; // indefinite
    }
  }

  async createPaymentLink(merchantId: number, dto: CreatePaymentLinkDto) {
    const expiresInDays = dto.expiresInDays || 7;
    const expiresAt = expiresInDays > 0 ? addDays(new Date(), expiresInDays) : null;

    const linkId = this.generateLinkId();
    this.logger.log(`Creating payment link: ${linkId} for merchant: ${merchantId}, Type: ${dto.type}`);

    let session: Stripe.Checkout.Session;
    let stripeSubscriptionId: string | null = null;
    let lineItems: any[] = [];

    // Handle subscription type
    if (dto.type === 'subscription') {
      if (!dto.frequency) {
        throw new BadRequestException('Frequency is required for subscription payment links');
      }

      const { interval, intervalCount } = this.getStripeInterval(dto.frequency, dto.customIntervalDays);
      
      // Create a price for the subscription
      const price = await this.stripe.prices.create({
        unit_amount: Math.round((dto.amount || 0) * 100),
        currency: (dto.currency || 'USD').toLowerCase(),
        recurring: { 
          interval, 
          ...(intervalCount && intervalCount !== 1 ? { interval_count: intervalCount } : {})
        },
        product_data: {
          name: dto.description || 'Subscription Payment',
        },
      });

      lineItems = [{
        price: price.id,
        quantity: 1,
      }];

      // Determine subscription end behavior
      const subscriptionEndDate = this.getSubscriptionEndDate(
        dto.durationType || 'recurring',
        dto.durationMonths,
        dto.totalPayments,
        dto.endDate,
      );

      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: lineItems,
        customer_email: dto.customerEmail,
        success_url: `${this.config.get('FRONTEND_URL')}/payment-link/success?session_id={CHECKOUT_SESSION_ID}&link_id=${linkId}`,
        cancel_url: `${this.config.get('FRONTEND_URL')}/payment-link/cancel`,
        subscription_data: subscriptionEndDate ? {
          trial_end: undefined,
          ...(subscriptionEndDate ? { cancel_at: Math.floor(subscriptionEndDate.getTime() / 1000) } : {}),
        } : {},
        metadata: {
          payment_link: 'true',
          link_id: linkId,
          merchant_id: String(merchantId),
          link_type: dto.type,
          frequency: dto.frequency,
          duration_type: dto.durationType || 'recurring',
          total_payments: String(dto.totalPayments || 0),
        },
      });

      stripeSubscriptionId = null; // Will be set when subscription.created webhook fires

    } else if (dto.type === 'fixed_amount') {
      // Fixed amount payment
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Payment' },
          unit_amount: Math.round((dto.amount || 0) * 100),
        },
        quantity: 1,
      }];
      
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
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
      });
      
    } else if (dto.type === 'flexible_amount') {
      // Flexible amount - customer enters amount at checkout
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Payment' },
          unit_amount: 100, // Placeholder
        },
        quantity: 1,
      }];
      
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        customer_email: dto.customerEmail,
        success_url: `${this.config.get('FRONTEND_URL')}/payment-link/success?session_id={CHECKOUT_SESSION_ID}&link_id=${linkId}`,
        cancel_url: `${this.config.get('FRONTEND_URL')}/payment-link/cancel`,
        metadata: {
          payment_link: 'true',
          link_id: linkId,
          merchant_id: String(merchantId),
          link_type: dto.type,
          flexible_amount: 'true',
        },
      });
      
    } else if (dto.type === 'quantity_limited') {
      lineItems = [{
        price_data: {
          currency: (dto.currency || 'USD').toLowerCase(),
          product_data: { name: dto.description || 'Payment' },
          unit_amount: Math.round((dto.amount || 0) * 100),
        },
        quantity: 1,
      }];
      
      session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        customer_email: dto.customerEmail,
        success_url: `${this.config.get('FRONTEND_URL')}/payment-link/success?session_id={CHECKOUT_SESSION_ID}&link_id=${linkId}`,
        cancel_url: `${this.config.get('FRONTEND_URL')}/payment-link/cancel`,
        metadata: {
          payment_link: 'true',
          link_id: linkId,
          merchant_id: String(merchantId),
          link_type: dto.type,
          quantity_total: String(dto.quantity || 1),
        },
      });
      
    } else {
      throw new BadRequestException(`Unsupported payment link type: ${dto.type}`);
    }

    this.logger.log(`Stripe session created: ${session.id}`);

    // Create payment link record
    const paymentLink = await this.prisma.paymentLink.create({
      data: {
        id: linkId,
        merchantId,
        type: dto.type,
        amount: dto.amount || null,
        currency: dto.currency || 'USD',
        description: dto.description,
        status: dto.type === 'subscription' ? 'active' : 'active',
        expiresAt,
        quantityTotal: dto.quantity || null,
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url,
        customerEmail: dto.customerEmail,
        // New subscription fields
        frequency: dto.type === 'subscription' ? dto.frequency : null,
        customIntervalDays: dto.type === 'subscription' && dto.frequency === 'custom' ? dto.customIntervalDays : null,
        durationType: dto.type === 'subscription' ? (dto.durationType || 'recurring') : null,
        durationMonths: dto.type === 'subscription' ? dto.durationMonths : null,
        totalPayments: dto.type === 'subscription' ? dto.totalPayments : null,
        paymentsMade: 0,
        endDate: dto.type === 'subscription' ? (dto.endDate || null) : null,
      },
    });

    // For flexible amount links, update the amount to be 0 and let customer set
    if (dto.type === 'flexible_amount') {
      await this.prisma.paymentLink.update({
        where: { id: linkId },
        data: { amount: 0 },
      });
    }

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
      include: {
        subscriptionPayments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return links.map(link => ({
      ...link,
      amount: link.type === 'flexible_amount' ? null : link.amount,
      paymentUrl: `${this.config.get('FRONTEND_URL')}/pay/${link.id}`,
      subscriptionInfo: link.type === 'subscription' ? {
        frequency: link.frequency,
        durationType: link.durationType,
        paymentsMade: link.paymentsMade,
        totalPayments: link.totalPayments,
        endDate: link.endDate,
      } : null,
    }));
  }

  // In payment-links.service.ts, fix the subscriptionDisplayInfo type

async getPublicPaymentLink(linkId: string) {
  const link = await this.prisma.paymentLink.findUnique({
    where: { id: linkId },
    include: { 
      merchant: { select: { fullName: true, email: true } },
      subscriptionPayments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!link) {
    throw new NotFoundException('Payment link not found');
  }

  if (link.expiresAt && new Date() > link.expiresAt) {
    throw new BadRequestException('This payment link has expired');
  }

  // Check subscription-specific limits
  if (link.type === 'subscription') {
    if (link.durationType === 'fixed_payments' && link.totalPayments && link.paymentsMade >= link.totalPayments) {
      throw new BadRequestException('This subscription has reached its payment limit');
    }
    
    if (link.durationType === 'end_date' && link.endDate && new Date() > link.endDate) {
      throw new BadRequestException('This subscription has expired');
    }
    
    if (link.durationType === 'fixed_term' && link.endDate && new Date() > link.endDate) {
      throw new BadRequestException('This subscription term has ended');
    }
  }

  if (link.type === 'quantity_limited' && link.quantityTotal && link.quantityUsed >= link.quantityTotal) {
    throw new BadRequestException('This payment link has reached its usage limit');
  }

  if (link.type !== 'quantity_limited' && link.type !== 'subscription' && link.status === 'paid') {
    throw new BadRequestException('This payment link has already been paid');
  }

  const status = link.type === 'quantity_limited' && link.status === 'partially_paid' ? 'active' : link.status;

    // Build subscription display info - FIXED: properly type as object or null
    let subscriptionDisplayInfo: {
      frequency: string;
      duration: string;
      paymentsMade: number;
      totalPayments: number | null;
      isActive: boolean;
    } | null = null;  // ✅ Explicitly type as null or the object

    if (link.type === 'subscription') {
      let frequencyText = '';
      switch (link.frequency) {
        case 'daily': frequencyText = 'Daily'; break;
        case 'weekly': frequencyText = 'Weekly'; break;
        case 'bi_monthly': frequencyText = 'Twice per month'; break;
        case 'monthly': frequencyText = 'Monthly'; break;
        case 'quarterly': frequencyText = 'Quarterly'; break;
        case 'semiannual': frequencyText = 'Every 6 months'; break;
        case 'annual': frequencyText = 'Annually'; break;
        case 'custom': frequencyText = `Every ${link.customIntervalDays} days`; break;
        default: frequencyText = 'Monthly';
      }
      
      let durationText = '';
      if (link.durationType === 'fixed_term' && link.durationMonths) {
        durationText = `for ${link.durationMonths} months`;
      } else if (link.durationType === 'fixed_payments' && link.totalPayments) {
        durationText = `for ${link.totalPayments} payments (${link.paymentsMade || 0} made)`;
      } else if (link.durationType === 'end_date' && link.endDate) {
        durationText = `until ${new Date(link.endDate).toLocaleDateString()}`;
      } else {
        durationText = 'until canceled';
      }
      
      subscriptionDisplayInfo = {  // ✅ Now this assignment is valid
        frequency: frequencyText,
        duration: durationText,
        paymentsMade: link.paymentsMade || 0,
        totalPayments: link.totalPayments || null,
        isActive: link.status === 'active' || link.status === 'subscription_active',
      };
    }

    return {
      id: link.id,
      type: link.type,
      amount: link.type === 'flexible_amount' ? null : link.amount,
      currency: link.currency,
      description: link.description,
      merchantName: link.merchant.fullName,
      status: status,
      stripeCheckoutUrl: link.stripeCheckoutUrl,
      quantityRemaining: link.type === 'quantity_limited' && link.quantityTotal 
        ? link.quantityTotal - link.quantityUsed 
        : undefined,
      subscriptionInfo: subscriptionDisplayInfo,  // ✅ Now this is either the object or null
    };
  }

  async getPaymentLinkById(linkId: string, merchantId: number) {
    const link = await this.prisma.paymentLink.findFirst({
      where: { id: linkId, merchantId },
      include: {
        subscriptionPayments: {
          orderBy: { createdAt: 'desc' },
        },
      },
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

    // Handle flexible amount - amount is in metadata or we need to get from Stripe
    let actualAmount = link.amount;
    if (link.type === 'flexible_amount') {
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        actualAmount = (paymentIntent.amount_received || paymentIntent.amount) / 100;
      } catch (error) {
        this.logger.warn(`Could not retrieve payment intent amount: ${error}`);
      }
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
          data: { walletBalance: { increment: actualAmount || link.amount || 0 } },
        });

        await tx.transaction.create({
          data: {
            transactionId: `paylink_${linkId}_${Date.now()}`,
            senderId: undefined,
            recipientId: link.merchantId,
            amount: actualAmount || link.amount || 0,
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

    // Handle single payment links (fixed_amount, flexible_amount)
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
        data: { walletBalance: { increment: actualAmount || link.amount || 0 } },
      });

      await tx.transaction.create({
        data: {
          transactionId: `paylink_${linkId}_${Date.now()}`,
          senderId: undefined,
          recipientId: link.merchantId,
          amount: actualAmount || link.amount || 0,
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

  // NEW: Handle subscription payment
  async handleSubscriptionPayment(subscriptionId: string, invoiceId: string, paymentIntentId: string, amount: number) {
    this.logger.log(`🔵 handleSubscriptionPayment: subscriptionId=${subscriptionId}, amount=${amount}`);

    const paymentLink = await this.prisma.paymentLink.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!paymentLink) {
      this.logger.warn(`No payment link found for subscription ${subscriptionId}`);
      return { success: false, message: 'Payment link not found' };
    }

    const newPaymentsMade = (paymentLink.paymentsMade || 0) + 1;
    let newStatus = paymentLink.status;
    
    if (paymentLink.durationType === 'fixed_payments' && paymentLink.totalPayments && newPaymentsMade >= paymentLink.totalPayments) {
      newStatus = 'subscription_completed';
    } else {
      newStatus = 'subscription_active';
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subscriptionPayment.create({
        data: {
          paymentLinkId: paymentLink.id,
          amount: amount,
          currency: paymentLink.currency,
          stripePaymentIntentId: paymentIntentId,
          stripeInvoiceId: invoiceId,
          paymentNumber: newPaymentsMade,
          status: 'succeeded',
        },
      });

      await tx.paymentLink.update({
        where: { id: paymentLink.id },
        data: {
          paymentsMade: newPaymentsMade,
          status: newStatus,
          stripePaymentIntentId: paymentIntentId,
        },
      });

      await tx.user.update({
        where: { id: paymentLink.merchantId },
        data: { walletBalance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          transactionId: `subscription_${subscriptionId}_${Date.now()}`,
          senderId: undefined,
          recipientId: paymentLink.merchantId,
          amount: amount,
          currency: paymentLink.currency,
          type: 'subscription_payment',
          status: 'completed',
          paymentMethod: 'stripe',
          description: `Subscription payment #${newPaymentsMade} via link: ${paymentLink.description || 'Subscription'}`,
        },
      });
    });

    this.logger.log(`✅ Subscription payment recorded: ${newPaymentsMade}/${paymentLink.totalPayments || '∞'}`);

    if (newStatus === 'subscription_completed' && paymentLink.stripeSubscriptionId) {
      try {
        await this.stripe.subscriptions.update(paymentLink.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        this.logger.log(`Subscription ${subscriptionId} marked for cancellation at period end`);
      } catch (error) {
        this.logger.error(`Failed to cancel subscription: ${error}`);
      }
    }

    return { success: true };
  }

  async cancelPaymentLink(linkId: string, merchantId: number) {
    const link = await this.prisma.paymentLink.findFirst({
      where: { 
        id: linkId, 
        merchantId, 
        status: { in: ['active', 'partially_paid', 'subscription_active'] } 
      },
    });

    if (!link) {
      throw new NotFoundException('Active payment link not found');
    }

    // If it's an active subscription, cancel in Stripe
    if (link.type === 'subscription' && link.stripeSubscriptionId && link.status === 'subscription_active') {
      try {
        await this.stripe.subscriptions.update(link.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        this.logger.log(`Subscription ${link.stripeSubscriptionId} cancelled at period end`);
      } catch (error) {
        this.logger.error(`Failed to cancel Stripe subscription: ${error}`);
      }
    }

    return this.prisma.paymentLink.update({
      where: { id: linkId },
      data: { status: 'cancelled' },
    });
  }
}