// src/payment-links/payment-link-webhook.controller.ts - FIXED

import { Controller, Post, Req, Headers, HttpCode, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentLinksService } from './payment-links.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Controller('stripe/payment-links')
export class PaymentLinkWebhookController {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentLinkWebhookController.name);

  constructor(
    private paymentLinksService: PaymentLinksService,
    private config: ConfigService,
  ) {
    const secret = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secret) throw new Error('STRIPE_SECRET_KEY missing in .env');
    this.stripe = new Stripe(secret, {
      apiVersion: '2025-11-17.clover' as any,
    });
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    const webhookSecret = this.config.get<string>('STRIPE_PAYMENT_LINKS_WEBHOOK_SECRET');
    
    this.logger.log('🔵 Webhook received at /stripe/payment-links/webhook');
    this.logger.log(`Signature: ${signature?.substring(0, 20)}...`);
    
    if (!webhookSecret) {
      this.logger.error('STRIPE_PAYMENT_LINKS_WEBHOOK_SECRET missing');
      throw new Error('STRIPE_PAYMENT_LINKS_WEBHOOK_SECRET missing');
    }

    if (!rawBody) {
      this.logger.error('Raw body missing');
      return { received: false, error: 'Raw body missing' };
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      this.logger.log(`✅ Webhook signature verified, event type: ${event.type}`);
    } catch (err: any) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      return { received: false, error: err.message };
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.metadata?.payment_link === 'true') {
        const linkId = session.metadata?.link_id;
        const paymentIntentId = session.payment_intent as string;
        const subscriptionId = session.subscription as string;
        
        // If this is a subscription, store the subscription ID
        if (subscriptionId && linkId) {
          await this.paymentLinksService['prisma'].paymentLink.update({
            where: { id: linkId },
            data: { stripeSubscriptionId: subscriptionId },
          });
          this.logger.log(`📋 Subscription ID stored: ${subscriptionId} for link ${linkId}`);
        }
        
        // Handle one-time payment
        if (session.mode === 'payment' && paymentIntentId && linkId) {
          const result = await this.paymentLinksService.markAsPaid(linkId, paymentIntentId);
          this.logger.log(`📊 markAsPaid result: ${JSON.stringify(result)}`);
        }
      }
    }

    // Handle invoice.payment_succeeded - FIXED PROPERTY NAMES
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any; // Use 'any' as workaround
      const subscriptionId = invoice.subscription as string | null;
      const paymentIntentId = invoice.payment_intent as string | null;
      const amount = invoice.amount_paid / 100;
      
      if (subscriptionId && paymentIntentId) {
        this.logger.log(`💰 Subscription payment succeeded: ${subscriptionId}, amount: ${amount}`);
        await this.paymentLinksService.handleSubscriptionPayment(
          subscriptionId,
          invoice.id,
          paymentIntentId,
          amount,
        );
      }
    }

    // Handle customer.subscription.updated
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;
      
      if (subscription.cancel_at_period_end || subscription.status === 'canceled') {
        this.logger.log(`🔄 Subscription updated/cancelled: ${subscriptionId}`);
        
        const paymentLink = await this.paymentLinksService['prisma'].paymentLink.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });
        
        if (paymentLink && paymentLink.status !== 'subscription_completed') {
          await this.paymentLinksService['prisma'].paymentLink.update({
            where: { id: paymentLink.id },
            data: { status: 'subscription_cancelled' },
          });
          this.logger.log(`📋 Payment link ${paymentLink.id} marked as subscription_cancelled`);
        }
      }
    }

    // Handle payment_intent.succeeded for quantity_limited
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;
      
      if (metadata?.payment_link === 'true' && metadata?.link_id) {
        const linkId = metadata.link_id;
        
        const link = await this.paymentLinksService['prisma'].paymentLink.findUnique({
          where: { id: linkId },
        });
        
        if (link && link.type === 'quantity_limited' && !link.stripeSubscriptionId) {
          const result = await this.paymentLinksService.markAsPaid(linkId, paymentIntent.id);
          this.logger.log(`📊 Quantity limited payment: ${JSON.stringify(result)}`);
        }
      }
    }

    return { received: true };
  }
}