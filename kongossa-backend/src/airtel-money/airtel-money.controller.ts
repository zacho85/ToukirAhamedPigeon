import { Controller, Post, Body } from '@nestjs/common';
import { AirtelMoneyService } from './airtel-money.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Airtel Money')
@ApiBearerAuth('bearer')
@Controller('airtel-money')
export class AirtelMoneyController {
  constructor(private readonly airtelMoneyService: AirtelMoneyService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    console.log('Airtel Money webhook received:', body);
    return { received: true };
  }
}