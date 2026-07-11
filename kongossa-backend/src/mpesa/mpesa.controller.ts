import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('mpesa')
export class MpesaController {
  constructor(private readonly mpesaService: MpesaService) {}

  @Public()
  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    console.log('M-Pesa webhook received:', body);
    return { received: true };
  }
}