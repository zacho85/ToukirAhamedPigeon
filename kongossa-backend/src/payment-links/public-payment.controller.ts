import { Controller, Get, Param } from '@nestjs/common';
import { PaymentLinksService } from './payment-links.service';

@Controller('pay')
export class PublicPaymentController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Get(':linkId')
  async getPaymentLink(@Param('linkId') linkId: string) {
    return this.paymentLinksService.getPublicPaymentLink(linkId);
  }
}