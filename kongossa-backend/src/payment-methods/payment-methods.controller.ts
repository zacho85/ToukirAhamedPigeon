import { Controller, Post, Get, Delete, Body, Req, Param, UseGuards } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AttachPaymentMethodDto } from './dto/attach-payment-method.dto';
import { AddMoMoWalletDto } from './dto/add-momo-wallet.dto';
import { AddOrangeMoneyWalletDto } from './dto/add-orange-money-wallet.dto';
import { AddTransfiWalletDto } from './dto/add-transfi-wallet.dto';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard)
export class PaymentMethodsController {
  constructor(private service: PaymentMethodsService) {}

  @Post('setup-intent')
  createSetupIntent(@Req() req: any) {
    // console.log(dto)
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
}
