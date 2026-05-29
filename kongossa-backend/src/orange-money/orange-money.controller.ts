import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrangeMoneyService } from './orange-money.service';

@Controller('orange-money')
export class OrangeMoneyController {
  private readonly logger = new Logger(OrangeMoneyController.name);

  constructor(private readonly orangeMoneyService: OrangeMoneyService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log('Orange Money webhook received', body);

    return { received: true };
  }
}
