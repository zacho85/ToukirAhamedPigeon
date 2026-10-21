// src/exchange-rate/exchange-rate.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SetRateDto } from './dto/set-rate.dto';

@ApiTags('Exchange Rate')
@ApiBearerAuth('bearer')
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('convert/:from/:to/:amount')
  async convert(
    @Param('from') from: string,
    @Param('to') to: string,
    @Param('amount') amount: string,
  ) {
    return this.exchangeRateService.convertAmount(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase(),
    );
  }

  @Get('currencies')
  async getSupportedCurrencies() {
    const currencies = await this.exchangeRateService.getSupportedCurrencies();
    const currenciesWithInfo = await Promise.all(
      currencies.map(async (code) => {
        const info = await this.exchangeRateService.getCurrencyInfo(code);
        return info;
      })
    );
    return { currencies: currenciesWithInfo };
  }

  @Get('rate/:from/:to')
  async getRate(@Param('from') from: string, @Param('to') to: string) {
    const rate = await this.exchangeRateService.getExchangeRate(from.toUpperCase(), to.toUpperCase());
    return { from, to, rate };
  }

  // A central decision: only superadmin holds update:currency-exchange (customers hold read:currency-exchange).
  @Post('rate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('update:currency-exchange')
  async setRate(@Body() body: SetRateDto) {
    await this.exchangeRateService.saveRate(
      body.from.toUpperCase(),
      body.to.toUpperCase(),
      body.rate,
      'manual',
    );
    return { success: true };
  }
}