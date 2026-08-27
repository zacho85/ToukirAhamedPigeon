// wallet-topup.controller.ts
import { Controller, Get, Post, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { WalletTopUpService } from './wallet-topup.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wallet Topup')
@ApiBearerAuth('bearer')
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

  // ✅ MTN MoMo
  @Post('momo')
  async createMoMoTopUp(
    @Req() req: any,
    @Body() body: { amount: number; paymentMethodId: number },
  ) {
    console.log('💰 MTN MoMo top-up request received');
    console.log('👤 User ID:', req.user.userId);
    console.log('💵 Amount:', body.amount);
    
    try {
      return await this.service.createMoMoTopUp(
        req.user.userId,
        body.amount,
        body.paymentMethodId,
      );
    } catch (error) {
      console.error('🔥 MoMo top-up error:', error);
      throw error;
    }
  }

  @Get('momo/:id/status')
  async checkMoMoStatus(@Param('id') id: string) {
    return this.service.checkMoMoTopUpStatus(Number(id));
  }

  // ✅ Orange Money
  @Post('orange')
  async createOrangeTopUp(
    @Req() req: any,
    @Body() body: { amount: number; paymentMethodId: number },
  ) {
    console.log('💰 Orange Money top-up request received');
    console.log('👤 User ID:', req.user.userId);
    console.log('💵 Amount:', body.amount);
    
    try {
      return await this.service.createOrangeTopUp(
        req.user.userId,
        body.amount,
        body.paymentMethodId,
      );
    } catch (error) {
      console.error('🔥 Orange Money top-up error:', error);
      throw error;
    }
  }

  @Get('orange/:id/status')
  async checkOrangeStatus(
    @Param('id') id: string,
    @Query('payToken') payToken?: string,
  ) {
    return this.service.checkOrangeTopUpStatus(Number(id), payToken);
  }

  @Public()
  @Post('orange/webhook')
  async handleOrangeWebhook(@Body() body: any) {
    console.log('📞 Orange Money webhook received');
    return this.service.handleOrangeWebhook(body);
  }

  // ✅ Transfi (Zamtel)
  @Post('transfi')
  async createTransfiTopUp(
    @Req() req: any,
    @Body() body: { amount: number; paymentMethodId: number },
  ) {
    console.log('💰 Transfi top-up request received');
    console.log('👤 User ID:', req.user.userId);
    console.log('💵 Amount:', body.amount);
    
    try {
      return await this.service.createTransfiTopUp(
        req.user.userId,
        body.amount,
        body.paymentMethodId,
      );
    } catch (error) {
      console.error('🔥 Transfi top-up error:', error);
      throw error;
    }
  }

  @Get('transfi/:id/status')
  async checkTransfiStatus(
    @Param('id') id: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.service.checkTransfiTopUpStatus(Number(id), orderId);
  }

  @Public()
  @Post('transfi/webhook')
  async handleTransfiWebhook(@Body() body: any) {
    console.log('📞 Transfi webhook received');
    return this.service.handleTransfiWebhook(body);
  }

  // ✅ M-Pesa (NEW)
  @Post('mpesa')
  async createMpesaTopUp(
    @Req() req: any,
    @Body() body: { amount: number; paymentMethodId: number },
  ) {
    console.log('💰 M-Pesa top-up request received');
    console.log('👤 User ID:', req.user.userId);
    console.log('💵 Amount:', body.amount);
    
    try {
      return await this.service.createMpesaTopUp(
        req.user.userId,
        body.amount,
        body.paymentMethodId,
      );
    } catch (error) {
      console.error('🔥 M-Pesa top-up error:', error);
      throw error;
    }
  }

  @Get('mpesa/:id/status')
  async checkMpesaStatus(@Param('id') id: string) {
    return this.service.checkMpesaTopUpStatus(Number(id));
  }

  // Stats
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async stats(@Req() req: any) {
    return this.service.getMonthlyStats(req.user.userId);
  }

  @Get('platform/stats')
  getPlatformStats() {
    return this.service.getPlatformStats();
  }

  @Post('paystack')
  async createPaystackTopUp(@Req() req: any, @Body() body: { amount: number; paymentMethodId: number }) {
    return this.service.createPaystackTopUp(req.user.userId, body.amount, body.paymentMethodId);
  }

  @Get('paystack/:id/status')
  async checkPaystackStatus(@Param('id') id: string) {
    return this.service.checkPaystackTopUpStatus(Number(id));
  }

  // ✅ Airtel Money Top-Up
  @Post('airtel')
  async createAirtelTopUp(
    @Req() req: any,
    @Body() body: { amount: number; paymentMethodId: number },
  ) {
    console.log('💰 Airtel Money top-up request received');
    console.log('👤 User ID:', req.user.userId);
    console.log('💵 Amount:', body.amount);
    
    try {
      return await this.service.createAirtelTopUp(
        req.user.userId,
        body.amount,
        body.paymentMethodId,
      );
    } catch (error) {
      console.error('🔥 Airtel Money top-up error:', error);
      throw error;
    }
  }

  @Get('airtel/:id/status')
  async checkAirtelStatus(@Param('id') id: string) {
    return this.service.checkAirtelTopUpStatus(Number(id));
  }
}