import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Flutterwave')
@ApiBearerAuth('bearer')
@Controller('flutterwave')
export class FlutterwaveController {
  constructor(private readonly flutterwaveService: FlutterwaveService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(@Body() body: any) {
    const result = await this.flutterwaveService.handleWebhook(body);
    // Process result (e.g., update wallet)
    return { received: true };
  }
}