import { Controller, Post, Get, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachPaymentMethodDto } from './dto/attach-payment-method.dto';
import { AddMoMoWalletDto } from './dto/add-momo-wallet.dto';
import { AddOrangeMoneyWalletDto } from './dto/add-orange-money-wallet.dto';
import { AddTransfiWalletDto } from './dto/add-transfi-wallet.dto';
import { AddMpesaWalletDto } from './dto/add-mpesa-wallet.dto';
import { AddPaystackWalletDto } from './dto/add-paystack-wallet.dto';
import { AddFlutterwaveWalletDto } from './dto/add-flutterwave-wallet.dto';
import { AddAirtelMoneyDto } from './dto/add-airtel-money.dto';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private service: PaymentMethodsService) {}

  @Post('setup-intent')
  createSetupIntent(@Req() req: any) {
    return this.service.createSetupIntent(req.user.userId);
  }

  @Post('attach')
  attach(@Req() req: any, @Body() dto: AttachPaymentMethodDto) {
    return this.service.attachPaymentMethod(
      req.user.userId,
      dto.paymentMethodId,
      dto,
    );
  }

  @Post('momo')
  addMoMo(@Req() req: any, @Body() dto: AddMoMoWalletDto) {
    return this.service.addMomoWallet(req.user.userId, dto);
  }

  @Post('orange')
  addOrangeMoney(@Req() req: any, @Body() dto: AddOrangeMoneyWalletDto) {
    return this.service.addOrangeMoneyWallet(req.user.userId, dto);
  }

  @Post('transfi')
  addTransfi(@Req() req: any, @Body() dto: AddTransfiWalletDto) {
    return this.service.addTransfiWallet(req.user.userId, dto);
  }

  @Post('mpesa')
  addMpesa(@Req() req: any, @Body() dto: AddMpesaWalletDto) {
    return this.service.addMpesaWallet(req.user.userId, dto);
  }

  @Get()
  list(@Req() req: any) {
    try {
      return this.service.list(req.user.userId);
    } catch (error) {
      console.error("Error listing payment methods:", error);
      throw new Error("Failed to list payment methods");
    }
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: number) {
    return this.service.remove(req.user.userId, Number(id));
  }

  @Post('paystack')
  addPaystack(@Req() req: any, @Body() dto: AddPaystackWalletDto) {
    return this.service.addPaystackWallet(req.user.userId, dto);
  }

  @Post('flutterwave')
  addFlutterwave(@Req() req: any, @Body() dto: AddFlutterwaveWalletDto) {
    return this.service.addFlutterwaveWallet(req.user.userId, dto);
  }

  @Post('airtel')
  addAirtelMoney(@Req() req: any, @Body() dto: AddAirtelMoneyDto) {
    return this.service.addAirtelMoneyWallet(req.user.userId, dto);
  }
}