import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { QRPaymentsService } from './qr-payments.service';
import { CreateQRPaymentDto } from './dto/create-qr-payment.dto';
import { UpdateQRPaymentDto } from './dto/update-qr-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Req } from '@nestjs/common';
import { TransactionsService } from '../transactions/transactions.service';

@Controller('qr-payments')
export class QRPaymentsController {
  constructor(
    private readonly qrPaymentsService: QRPaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post()
  create(@Body() createDto: CreateQRPaymentDto) {
    return this.qrPaymentsService.create(createDto);
  }

  @Get()
  findAll(
    @Query('qrCode') qrCode?: string,
    @Query('recipientId', ParseIntPipe) recipientId?: number,
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
      recipientId,
      amount,
      currency,
      description,
      isActive,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit,
      usageCount,
      paymentType,
    };
    return this.qrPaymentsService.findAll(query);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.qrPaymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateQRPaymentDto) {
    return this.qrPaymentsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.qrPaymentsService.remove(id);
  }
  @Post(':id/pay')
  @UseGuards(JwtAuthGuard)
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
