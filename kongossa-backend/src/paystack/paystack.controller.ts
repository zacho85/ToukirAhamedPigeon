import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    const result = await this.paystackService.handleWebhook(body, signature);
    // result will be processed elsewhere (e.g., update wallet)
    return { received: true };
  }
}