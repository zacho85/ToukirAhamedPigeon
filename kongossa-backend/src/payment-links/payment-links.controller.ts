import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentLinksService } from './payment-links.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payment-links')
export class PaymentLinksController {
  constructor(private readonly paymentLinksService: PaymentLinksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPaymentLink(@Req() req: any, @Body() dto: CreatePaymentLinkDto) {
    return this.paymentLinksService.createPaymentLink(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyPaymentLinks(@Req() req: any) {
    return this.paymentLinksService.getMerchantPaymentLinks(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentLinkById(@Param('id') id: string, @Req() req: any) {
    return this.paymentLinksService.getPaymentLinkById(id, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancelPaymentLink(@Param('id') id: string, @Req() req: any) {
    return this.paymentLinksService.cancelPaymentLink(id, req.user.userId);
  }
}