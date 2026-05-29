import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MomoService } from './momo.service';

@Controller('momo')
export class MomoController {
  private readonly logger = new Logger(MomoController.name);

  constructor(private readonly momoService: MomoService) {}

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log('MoMo webhook received', body);

    // MTN MoMo can send status updates here
    // Validate and process accordingly
    return { received: true };
  }
}
