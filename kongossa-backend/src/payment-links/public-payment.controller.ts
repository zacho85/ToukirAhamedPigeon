import { Controller, Get, Param } from '@nestjs/common';
import { PaymentLinksService } from './payment-links.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

// PUBLIC: Public payer-facing checkout page.
@Public()
@ApiTags('Pay')
@Controller('pay')
export class PublicPaymentController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Get(':linkId')
  async getPaymentLink(@Param('linkId') linkId: string) {
    return this.paymentLinksService.getPublicPaymentLink(linkId);
  }
}