import { Controller, Post, Body, Logger } from '@nestjs/common';
import { TransfiService } from './transfi.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('transfi')
export class TransfiController {
  private readonly logger = new Logger(TransfiController.name);

  constructor(private readonly transfiService: TransfiService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    this.logger.log('Transfi webhook received', body);
    return { received: true };
  }
}
