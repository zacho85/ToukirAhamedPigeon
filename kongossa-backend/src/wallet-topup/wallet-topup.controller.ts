import { Controller, Get, Post, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { WalletTopUpService } from './wallet-topup.service';

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

  // ✅ ADD: MoMo Top-Up
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

  // ✅ ADD: MoMo Status Check
  @Get('momo/:id/status')
  async checkMoMoStatus(@Param('id') id: string) {
    return this.service.checkMoMoTopUpStatus(Number(id));
  }

  // ✅ ADD: Orange Money Top-Up
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

  // ✅ ADD: Orange Money Status Check
  @Get('orange/:id/status')
  async checkOrangeStatus(
    @Param('id') id: string,
    @Query('payToken') payToken?: string,
  ) {
    return this.service.checkOrangeTopUpStatus(Number(id), payToken);
  }

  // ✅ ADD: Orange Money Webhook (Public)
  @Public()
  @Post('orange/webhook')
  async handleOrangeWebhook(@Body() body: any) {
    console.log('📞 Orange Money webhook received');
    return this.service.handleOrangeWebhook(body);
  }

  // ✅ ADD: Transfi/Zamtel Top-Up
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

  // ✅ ADD: Transfi Status Check
  @Get('transfi/:id/status')
  async checkTransfiStatus(
    @Param('id') id: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.service.checkTransfiTopUpStatus(Number(id), orderId);
  }

  // ✅ ADD: Transfi Webhook (Public)
  @Public()
  @Post('transfi/webhook')
  async handleTransfiWebhook(@Body() body: any) {
    console.log('📞 Transfi webhook received');
    return this.service.handleTransfiWebhook(body);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async stats(@Req() req: any) {
    return this.service.getMonthlyStats(req.user.id);
  }

  @Get('platform/stats')
  getPlatformStats() {
    return this.service.getPlatformStats();
  }
}