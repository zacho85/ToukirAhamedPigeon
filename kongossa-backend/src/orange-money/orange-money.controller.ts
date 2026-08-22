import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OrangeMoneyService } from './orange-money.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';

// PUBLIC: Orange Money provider callback. MUST verify the provider signature.
@Public()
@ApiTags('Orange Money')
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
