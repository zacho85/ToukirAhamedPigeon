import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletPayoutService } from './wallet-payout.service';

@Controller('wallet-payout')
@UseGuards(JwtAuthGuard)
export class WalletPayoutController {
  constructor(private service: WalletPayoutService) {}

  @Post('request')
  request(
    @Req() req:any,
    @Body() body: { amount: number }
  ) {
    try {
      return this.service.requestPayout(req.user.userId, body.amount);
    } catch (error) {
      throw error;
    }
  }
}
