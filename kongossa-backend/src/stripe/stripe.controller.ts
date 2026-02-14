import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express'; // ✅ import as type
import type { RawBodyRequest } from '@nestjs/common'; // ✅ import as type
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.stripeService.createCheckoutSession(dto);
  }

  @Post('verify')
  verify(@Body('session_id') sessionId: string) {
    return this.stripeService.verifyCheckoutSession(sessionId);
  }

 @Post('webhook')
 @HttpCode(200) // Stripe requires 200 OK
 async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
    ) {
    const rawBody = (req as any).rawBody;

    console.log('Webhook signature:', signature);
    console.log('Webhook raw body:', rawBody);

    if (!rawBody) {
        throw new Error(
        'Webhook raw body missing. Ensure stripeRawBodyMiddleware() is applied',
        );
    }

    return this.stripeService.handleWebhook(signature, rawBody);
    }

    @Post('connect/create')
    createConnect(@Req() req: any) {
        return this.stripeService.createConnectAccount(req.user.userId);
    }

    @Post('connect/onboard')
    startOnboarding(@Req() req: any) {
        return this.stripeService.createOnboardingLink(req.user.userId);
    }
}
