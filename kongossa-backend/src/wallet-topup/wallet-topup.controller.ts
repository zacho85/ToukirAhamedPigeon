import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletTopUpService } from './wallet-topup.service';

@Controller('wallet-topup')
@UseGuards(JwtAuthGuard)
export class WalletTopUpController {
  constructor(private service: WalletTopUpService) {}

  @Post('intent')
  createIntent(
    @Req() req: any,
    @Body() body: {userId: number; amount: number; paymentMethodId: string, remarks?: string }
  ) {
    try {
      return this.service.createTopUpIntent(
        req.user.userId,
        body.amount,
        body.paymentMethodId,
        body.remarks
      );
    } catch (error) {
        console.log(error);
    }
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async stats(@Req() req:any) {
    return this.service.getMonthlyStats(req.user.id);
  }

  @Get('platform/stats')
  getPlatformStats() {
    return this.service.getPlatformStats();
  }

//    @Post('webhook')
//     async handleStripeWebhook(
//     @Req() req: Request,
//     @Headers('stripe-signature') sig: string,
//     ) {
//         const event = this.stripe.constructEvent(req, sig);

//         if (event.type === 'payment_intent.succeeded') {
//             await this.walletTopUpService.handleSuccess(
//             event.data.object as Stripe.PaymentIntent,
//             );
//         }

//         return { received: true };
//     }

}
