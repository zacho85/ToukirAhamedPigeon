import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { QRPaymentsService } from './qr-payments.service';
import { CreateQRPaymentDto } from './dto/create-qr-payment.dto';
import { UpdateQRPaymentDto } from './dto/update-qr-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Qr Payments')
@ApiBearerAuth('bearer')
@Controller('qr-payments')
@UseGuards(JwtAuthGuard)
export class QRPaymentsController {
  constructor(
    private readonly qrPaymentsService: QRPaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() createDto: CreateQRPaymentDto) {
    return this.qrPaymentsService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('qrCode') qrCode?: string,
    @Query('amount') amount?: number,
    @Query('currency') currency?: string,
    @Query('description') description?: string,
    @Query('isActive') isActive?: boolean,
    @Query('expiryDate') expiryDate?: string,
    @Query('usageLimit') usageLimit?: number,
    @Query('usageCount') usageCount?: number,
    @Query('paymentType') paymentType?: string,
  ) {
    const query = {
      qrCode,
      amount,
      currency,
      description,
      isActive,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit,
      usageCount,
      paymentType,
    };
    return this.qrPaymentsService.findAllForUser(req.user.userId, query);
  }


  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.qrPaymentsService.findOwned(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateQRPaymentDto,
  ) {
    return this.qrPaymentsService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.qrPaymentsService.remove(id, req.user.userId);
  }

  @Post(':id/pay')
  async payQRPayment(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { amount?: number },
  ) {
    const result = await this.transactionsService.processQRPayment(
      req.user.userId,
      id,
      body.amount,
    );
    
    return result;
  }
}
