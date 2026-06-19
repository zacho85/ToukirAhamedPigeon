import { Module } from '@nestjs/common';
import { PaymentLinksController } from './payment-links.controller';
import { PublicPaymentController } from './public-payment.controller';
import { PaymentLinkWebhookController } from './payment-link-webhook.controller';
import { PaymentLinksService } from './payment-links.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Module({
  controllers: [
    PaymentLinksController,
    PublicPaymentController,
    PaymentLinkWebhookController,
  ],
  providers: [
    PaymentLinksService,
    PrismaService,
    ConfigService,
    ExchangeRateService,
  ],
  exports: [PaymentLinksService],
})
export class PaymentLinksModule {}