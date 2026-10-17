import { BadRequestException, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { FeesService } from './fees.service';

@ApiTags('Fees')
@ApiBearerAuth('bearer')
@Controller('fees')
export class FeesController {
  constructor(private readonly fees: FeesService) {}

  /**
   * What the signed-in customer would pay, shown before they approve:
   * kind=transfer (to another KongossaPay user) or kind=withdrawal (cash out at an agent, or a payout to the bank).
   */
  @Get('quote')
  async quote(@Req() req, @Query('kind') kind: string, @Query('amount') amountRaw: string) {
    const amount = Math.round(Number(amountRaw) * 100) / 100;
    if (!(amount > 0)) throw new BadRequestException('amount must be a positive number');

    if (kind === 'transfer') {
      const t = await this.fees.transferFee(req.user.userId, amount);
      return { kind, amount, fee: t.fee, total: Math.round((amount + t.fee) * 100) / 100, freeLeft: t.freeLeft, freeDailyAmount: t.freeDailyAmount, percent: t.percent };
    }
    if (kind === 'withdrawal') {
      const fee = await this.fees.withdrawalFee(amount);
      const { withdrawalFeePercent } = await this.fees.getSettings();
      return { kind, amount, fee, total: Math.round((amount + fee) * 100) / 100, percent: withdrawalFeePercent };
    }
    throw new BadRequestException('kind must be transfer or withdrawal');
  }

  /** Fees collected minus agent commission paid. */
  @Get('platform-account')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('read:fee-management')
  async platformAccount() {
    return this.fees.getPlatformBalance();
  }
}
