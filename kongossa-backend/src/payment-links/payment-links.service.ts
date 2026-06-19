// payment-links.service.ts - FULLY UPDATED AND FIXED (Fixed-Term Subscriptions without cancel_at)
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { addDays } from 'date-fns';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class PaymentLinksService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentLinksService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private exchangeRateService: ExchangeRateService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secret) throw new Error('STRIPE_SECRET_KEY missing in .env');
    this.stripe = new Stripe(secret, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }

  private getStripeInterval(frequency: string, customDays?: number): { interval: Stripe.Price.Recurring.Interval; intervalCount?: number } {
    switch (frequency) {
      case 'daily':
        return { interval: 'day', intervalCount: 1 };
      case 'weekly':
        return { interval: 'week', intervalCount: 1 };
      case 'bi_monthly':
        return { interval: 'month', intervalCount: 1 };
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
        return null;
      case 'end_date':
        return endDate || null;
      case 'recurring':
      default:
        return null;
    }
  }

  private generateLinkId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `pl_${timestamp}${random}`;
  }

  async createPaymentLink(merchantId: number, dto: CreatePaymentLinkDto) {
    try {
      const expiresInDays = dto.expiresInDays || 7;
      const expiresAt = expiresInDays > 0 ? addDays(new Date(), expiresInDays) : null;

      const linkId = this.generateLinkId();
      this.logger.log(`Creating payment link: ${linkId} for merchant: ${merchantId}, Type: ${dto.type}`);
      this.logger.log(`DTO received: ${JSON.stringify(dto)}`);

      // Currency conversion logic
      let finalAmount = dto.amount;
      let finalCurrency = dto.currency || 'USD';
      let exchangeRate = 1;
      let originalAmount = dto.amount;
      let originalCurrency = dto.currency || 'USD';

      if (dto.autoConvert && dto.amount && dto.currency && dto.currency !== dto.baseCurrency) {
        try {
          this.logger.log(`Attempting to convert ${dto.amount} ${dto.currency} to ${dto.baseCurrency}`);
          const conversion = await this.exchangeRateService.convertAmount(
            dto.amount,
            dto.currency,
            dto.baseCurrency || 'USD',
          );
          finalAmount = conversion.convertedAmount;
          finalCurrency = dto.baseCurrency || 'USD';
          exchangeRate = conversion.rate;
          originalAmount = dto.amount;
          originalCurrency = dto.currency;
          this.logger.log(`Converted ${dto.amount} ${dto.currency} to ${finalAmount} ${finalCurrency} (rate: ${exchangeRate})`);
        } catch (error) {
          this.logger.warn(`Currency conversion failed: ${error.message}, using original currency`);
          finalCurrency = dto.currency;
        }
      }

      let session: Stripe.Checkout.Session;
      let lineItems: any[] = [];

      this.logger.log(`Processing payment link type: ${dto.type}`);

      if (dto.type === 'subscription') {
        if (!dto.frequency) {
          throw new BadRequestException('Frequency is required for subscription payment links');
        }

        this.logger.log(`Creating subscription with frequency: ${dto.frequency}, interval: ${dto.customIntervalDays || 'N/A'}`);

        const { interval, intervalCount } = this.getStripeInterval(dto.frequency, dto.customIntervalDays);
        
        this.logger.log(`Stripe interval: ${interval}, intervalCount: ${intervalCount}`);

        const price = await this.stripe.prices.create({
          unit_amount: Math.round((finalAmount || 0) * 100),
          currency: finalCurrency.toLowerCase(),
          recurring: { 
            interval, 
            ...(intervalCount && intervalCount !== 1 ? { interval_count: intervalCount } : {})
          },
          product_data: {
            name: dto.description || 'Subscription Payment',
          },
        });

        this.logger.log(`Stripe price created: ${price.id}`);

        lineItems = [{
          price: price.id,
          quantity: 1,
        }];

        // Calculate end date for database storage (not for Stripe)
        const subscriptionEndDate = this.getSubscriptionEndDate(
          dto.durationType || 'recurring',
          dto.durationMonths,
          dto.totalPayments,
          dto.endDate,
        );

        this.logger.log(`Subscription end date (for DB tracking): ${subscriptionEndDate || 'None (recurring)'}`);

        // Build session params WITHOUT subscription_data for fixed_term
        // We'll track the end date manually in our database
        const sessionParams: any = {
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: lineItems,
          customer_email: dto.customerEmail,
          success_url: `${this.config.get('FRONTEND_URL')}/payment-link/success?session_id={CHECKOUT_SESSION_ID}&link_id=${linkId}`,
          cancel_url: `${this.config.get('FRONTEND_URL')}/payment-link/cancel`,
          metadata: {
            payment_link: 'true',
            link_id: linkId,
            merchant_id: String(merchantId),
            link_type: dto.type,
            frequency: dto.frequency,
            duration_type: dto.durationType || 'recurring',
            duration_months: String(dto.durationMonths || 0),
            total_payments: String(dto.totalPayments || 0),
            end_date: dto.endDate ? dto.endDate.toISOString() : '',
            original_currency: originalCurrency,
            original_amount: String(originalAmount || 0),
            converted_currency: finalCurrency,
            converted_amount: String(finalAmount || 0),
            exchange_rate: String(exchangeRate),
          },
        };

        // ✅ FIX: Do NOT add subscription_data with cancel_at for fixed_term
        // We will handle the end date manually via webhooks
        // For recurring subscriptions, we don't need subscription_data at all

        this.logger.log(`Creating Stripe checkout session without cancel_at (manual tracking)`);

        session = await this.stripe.checkout.sessions.create(sessionParams);

      } else if (dto.type === 'fixed_amount') {
        this.logger.log(`Creating fixed amount payment of ${finalAmount} ${finalCurrency}`);
        
        lineItems = [{
          price_data: {
            currency: finalCurrency.toLowerCase(),
            product_data: { name: dto.description || 'Payment' },
            unit_amount: Math.round((finalAmount || 0) * 100),
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
            original_currency: originalCurrency,
            original_amount: String(originalAmount || 0),
            converted_currency: finalCurrency,
            converted_amount: String(finalAmount || 0),
            exchange_rate: String(exchangeRate),
          },
        });
        
      } else if (dto.type === 'flexible_amount') {
        this.logger.log(`Creating flexible amount payment`);
        
        lineItems = [{
          price_data: {
            currency: finalCurrency.toLowerCase(),
            product_data: { name: dto.description || 'Payment' },
            unit_amount: 100,
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
        this.logger.log(`Creating quantity limited payment with total: ${dto.quantity}`);
        
        lineItems = [{
          price_data: {
            currency: finalCurrency.toLowerCase(),
            product_data: { name: dto.description || 'Payment' },
            unit_amount: Math.round((finalAmount || 0) * 100),
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
      this.logger.log(`Stripe session URL: ${session.url}`);

      // Calculate end date for database storage
      let endDateForDB = null;
      if (dto.type === 'subscription') {
        if (dto.durationType === 'fixed_term' && dto.durationMonths) {
          const end = new Date();
          end.setMonth(end.getMonth() + dto.durationMonths);
          endDateForDB = end;
        } else if (dto.durationType === 'end_date' && dto.endDate) {
          endDateForDB = dto.endDate;
        }
      }

      this.logger.log(`Creating PaymentLink record in database...`);
      this.logger.log(`Data to save: ${JSON.stringify({
        id: linkId,
        merchantId,
        type: dto.type,
        amount: finalAmount || null,
        currency: finalCurrency,
        description: dto.description,
        status: dto.type === 'subscription' ? 'active' : 'active',
        expiresAt,
        quantityTotal: dto.quantity || null,
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url,
        customerEmail: dto.customerEmail,
        frequency: dto.type === 'subscription' ? dto.frequency : null,
        customIntervalDays: dto.type === 'subscription' && dto.frequency === 'custom' ? dto.customIntervalDays : null,
        durationType: dto.type === 'subscription' ? (dto.durationType || 'recurring') : null,
        durationMonths: dto.type === 'subscription' ? dto.durationMonths : null,
        totalPayments: dto.type === 'subscription' ? dto.totalPayments : null,
        paymentsMade: 0,
        endDate: endDateForDB,
        stripeSubscriptionId: null,
      })}`);

      try {
        const paymentLink = await this.prisma.paymentLink.create({
          data: {
            id: linkId,
            merchantId,
            type: dto.type,
            amount: finalAmount || null,
            currency: finalCurrency,
            description: dto.description,
            status: dto.type === 'subscription' ? 'active' : 'active',
            expiresAt,
            quantityTotal: dto.quantity || null,
            stripeSessionId: session.id,
            stripeCheckoutUrl: session.url,
            customerEmail: dto.customerEmail,
            frequency: dto.type === 'subscription' ? dto.frequency : null,
            customIntervalDays: dto.type === 'subscription' && dto.frequency === 'custom' ? dto.customIntervalDays : null,
            durationType: dto.type === 'subscription' ? (dto.durationType || 'recurring') : null,
            durationMonths: dto.type === 'subscription' ? dto.durationMonths : null,
            totalPayments: dto.type === 'subscription' ? dto.totalPayments : null,
            paymentsMade: 0,
            endDate: endDateForDB,
            stripeSubscriptionId: null,
          },
        });

        this.logger.log(`PaymentLink record created: ${paymentLink.id}`);

        if (dto.autoConvert && dto.amount && dto.currency && dto.currency !== finalCurrency) {
          this.logger.log(`Creating CurrencyConversion record...`);
          await this.prisma.currencyConversion.create({
            data: {
              paymentLinkId: linkId,
              fromCurrency: dto.currency,
              toCurrency: finalCurrency,
              originalAmount: dto.amount,
              convertedAmount: finalAmount || dto.amount,
              exchangeRate: exchangeRate,
              rateSource: 'api',
            },
          });
          this.logger.log(`CurrencyConversion record created`);
        }

        if (dto.type === 'flexible_amount') {
          await this.prisma.paymentLink.update({
            where: { id: linkId },
            data: { amount: 0 },
          });
        }

        return {
          ...paymentLink,
          paymentUrl: `${this.config.get('FRONTEND_URL')}/pay/${paymentLink.id}`,
          originalAmount: dto.amount,
          originalCurrency: dto.currency,
          convertedAmount: finalAmount,
          convertedCurrency: finalCurrency,
          exchangeRate: exchangeRate !== 1 ? exchangeRate : undefined,
        };
      } catch (dbError) {
        this.logger.error(`❌ Database error when creating payment link: ${dbError.message}`);
        this.logger.error(`Stack trace: ${dbError.stack}`);
        throw dbError;
      }
    } catch (error) {
      this.logger.error(`❌ Failed to create payment link: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      console.error('Full error:', error);
      throw new BadRequestException(`Failed to create payment link: ${error.message}`);
    }
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

    let subscriptionDisplayInfo: {
      frequency: string;
      duration: string;
      paymentsMade: number;
      totalPayments: number | null;
      isActive: boolean;
    } | null = null;

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
      
      subscriptionDisplayInfo = {
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
      subscriptionInfo: subscriptionDisplayInfo,
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

  async getPaymentLinkWithExchangeRates(linkId: string) {
    const link = await this.prisma.paymentLink.findUnique({
      where: { id: linkId },
      include: {
        merchant: { select: { fullName: true, email: true } },
        currencyConversions: true,
      },
    });

    if (!link) {
      throw new NotFoundException('Payment link not found');
    }

    const currencies = await this.exchangeRateService.getSupportedCurrencies();
    const rates: Record<string, number> = {};
    
    for (const currency of currencies) {
      if (currency !== link.currency) {
        try {
          rates[currency] = await this.exchangeRateService.getExchangeRate(link.currency, currency);
        } catch (error) {
          this.logger.warn(`Could not get rate for ${currency}`);
        }
      }
    }

    return {
      ...link,
      availableCurrencies: currencies,
      exchangeRates: rates,
    };
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

    let actualAmount = link.amount;
    if (link.type === 'flexible_amount') {
      try {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        actualAmount = (paymentIntent.amount_received || paymentIntent.amount) / 100;
      } catch (error) {
        this.logger.warn(`Could not retrieve payment intent amount: ${error}`);
      }
    }

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

  async handleSubscriptionPayment(subscriptionId: string, invoiceId: string, paymentIntentId: string, amount: number) {
    this.logger.log(`🔵 handleSubscriptionPayment: subscriptionId=${subscriptionId}, amount=${amount}`);

    const paymentLink = await this.prisma.paymentLink.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
    });

    if (!paymentLink) {
      this.logger.warn(`No payment link found for subscription ${subscriptionId}`);
      return { success: false, message: 'Payment link not found' };
    }

    // Check if this subscription has ended (for fixed_term)
    if (paymentLink.durationType === 'fixed_term' && paymentLink.endDate && new Date(paymentLink.endDate) <= new Date()) {
      this.logger.log(`Subscription ${subscriptionId} has reached its end date, marking as completed`);
      await this.prisma.paymentLink.update({
        where: { id: paymentLink.id },
        data: { status: 'subscription_completed' },
      });
      // Cancel in Stripe
      try {
        await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
        this.logger.log(`Subscription ${subscriptionId} cancelled at period end due to fixed term completion`);
      } catch (error) {
        this.logger.error(`Failed to cancel subscription: ${error}`);
      }
      return { success: true, message: 'Subscription completed' };
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

    // If subscription is completed (fixed_payments), cancel in Stripe
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