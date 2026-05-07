import { Module } from '@nestjs/common';
import { PaymentLinksController } from './payment-links.controller';
import { PublicPaymentController } from './public-payment.controller';
import { PaymentLinkWebhookController } from './payment-link-webhook.controller';
import { PaymentLinksService } from './payment-links.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

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
  ],
  exports: [PaymentLinksService],
})
export class PaymentLinksModule {}