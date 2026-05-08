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

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      this.logger.log(`💰 Checkout session completed: ${session.id}`);
      this.logger.log(`Metadata: ${JSON.stringify(session.metadata)}`);
      
      if (session.metadata?.payment_link === 'true') {
        const linkId = session.metadata?.link_id;
        const paymentIntentId = session.payment_intent as string;
        
        this.logger.log(`🎯 Payment link detected! linkId: ${linkId}, paymentIntentId: ${paymentIntentId}`);
        
        if (linkId && paymentIntentId) {
          const result = await this.paymentLinksService.markAsPaid(linkId, paymentIntentId);
          this.logger.log(`📊 markAsPaid result: ${JSON.stringify(result)}`);
        } else {
          this.logger.error(`Missing linkId or paymentIntentId: linkId=${linkId}, paymentIntentId=${paymentIntentId}`);
        }
      } else {
        this.logger.log(`Session metadata does not contain payment_link flag`);
      }
    } else {
      this.logger.log(`Ignoring event type: ${event.type}`);
    }

    return { received: true };
  }
}