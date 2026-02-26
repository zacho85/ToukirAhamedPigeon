import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletTopUpService } from './wallet-topup.service';

@Controller('wallet-topup')
@UseGuards(JwtAuthGuard)
export class WalletTopUpController {
  constructor(private service: WalletTopUpService) {}

  @Post('intent')
async createIntent(
  @Req() req: any,
  @Body() body: { amount: number; paymentMethodId: string; remarks?: string }
) {
  console.log('💰 Wallet topup intent request received');
  console.log('👤 User ID:', req.user.userId);
  console.log('💵 Amount:', body.amount);
  console.log('💳 Payment Method ID:', body.paymentMethodId);
  console.log('📝 Remarks:', body.remarks);
  console.error('This is a test error log'); 
  try {
    const result = await this.service.createTopUpIntent(
      req.user.userId,
      body.amount,
      body.paymentMethodId,
      body.remarks
    );
    console.log('✅ Topup intent created successfully');
    return result;
  } catch (error) {
    console.error('🔥 CATCHED ERROR:', error);
    console.error('Stack:', error.stack);
    throw error;
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
