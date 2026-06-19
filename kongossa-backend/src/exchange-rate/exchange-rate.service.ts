// src/exchange-rate/exchange-rate.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { CURRENCY_CODES } from '../constants/currencies';

@Injectable()
export class ExchangeRateService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRateService.name);
  private cache: Map<string, { rate: number; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour
  private supportedCurrencies: string[] = [];

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.fetchSupportedCurrencies();
    await this.initializeDefaultRates();
  }

  private async fetchSupportedCurrencies() {
    try {
      // Fetch from Frankfurter API
      const response = await axios.get('https://api.frankfurter.app/currencies', { timeout: 5000 });
      this.supportedCurrencies = Object.keys(response.data);
      this.logger.log(`✅ Fetched ${this.supportedCurrencies.length} currencies from Frankfurter`);
    } catch (error) {
      this.logger.warn(`Failed to fetch currencies from API: ${error.message}`);
      // Fallback to hardcoded list
      this.supportedCurrencies = CURRENCY_CODES;
      this.logger.log(`Using fallback currency list: ${this.supportedCurrencies.length} currencies`);
    }
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return this.supportedCurrencies;
  }

  async getCurrencyInfo(currencyCode: string) {
    const { CURRENCY_MAP } = await import('../constants/currencies');
    return CURRENCY_MAP[currencyCode] || { 
      code: currencyCode, 
      name: currencyCode, 
      country: 'Unknown', 
      flag: '🏳️', 
      symbol: currencyCode 
    };
  }

  async getAllCurrenciesWithInfo() {
    const { CURRENCIES } = await import('../constants/currencies');
    return CURRENCIES.filter(c => this.supportedCurrencies.includes(c.code));
  }

  private async initializeDefaultRates() {
    const defaultRates = [
      { from: 'USD', to: 'EUR', rate: 0.92 },
      { from: 'USD', to: 'GBP', rate: 0.78 },
      { from: 'USD', to: 'CAD', rate: 1.35 },
      { from: 'USD', to: 'JPY', rate: 148.0 },
      { from: 'USD', to: 'CHF', rate: 0.88 },
      { from: 'USD', to: 'AUD', rate: 1.49 },
      { from: 'USD', to: 'CNY', rate: 7.25 },
      { from: 'USD', to: 'HKD', rate: 7.82 },
      { from: 'USD', to: 'NZD', rate: 1.62 },
      { from: 'USD', to: 'SEK', rate: 10.45 },
      { from: 'USD', to: 'KRW', rate: 1330.0 },
      { from: 'USD', to: 'SGD', rate: 1.34 },
      { from: 'USD', to: 'NOK', rate: 10.55 },
      { from: 'USD', to: 'MXN', rate: 16.85 },
      { from: 'USD', to: 'INR', rate: 83.5 },
      { from: 'USD', to: 'BRL', rate: 4.95 },
      { from: 'USD', to: 'RUB', rate: 88.0 },
      { from: 'USD', to: 'ZAR', rate: 18.95 },
      { from: 'USD', to: 'TRY', rate: 32.15 },
      { from: 'USD', to: 'DKK', rate: 6.86 },
      { from: 'USD', to: 'PLN', rate: 3.95 },
      { from: 'USD', to: 'THB', rate: 36.25 },
      { from: 'USD', to: 'IDR', rate: 15650.0 },
      { from: 'USD', to: 'HUF', rate: 360.5 },
      { from: 'USD', to: 'CZK', rate: 22.85 },
      { from: 'USD', to: 'ILS', rate: 3.68 },
      { from: 'USD', to: 'PHP', rate: 56.25 },
      { from: 'USD', to: 'MYR', rate: 4.72 },
      { from: 'USD', to: 'RON', rate: 4.58 },
      { from: 'USD', to: 'ISK', rate: 137.5 },
      { from: 'USD', to: 'BGN', rate: 1.80 },
      { from: 'EUR', to: 'USD', rate: 1.09 },
      { from: 'EUR', to: 'GBP', rate: 0.85 },
      { from: 'EUR', to: 'CHF', rate: 0.96 },
      { from: 'EUR', to: 'JPY', rate: 160.5 },
      { from: 'EUR', to: 'CAD', rate: 1.47 },
    ];

    for (const rate of defaultRates) {
      try {
        await this.prisma.exchangeRate.upsert({
          where: {
            fromCurrency_toCurrency: {
              fromCurrency: rate.from,
              toCurrency: rate.to,
            },
          },
          update: {},
          create: {
            fromCurrency: rate.from,
            toCurrency: rate.to,
            rate: rate.rate,
            source: 'default',
          },
        });
      } catch (error) {
        this.logger.warn(`Could not create default rate for ${rate.from}->${rate.to}: ${error.message}`);
      }
    }
    this.logger.log('Default exchange rates initialized');
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1.0;

    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Using cached rate for ${fromCurrency}->${toCurrency}: ${cached.rate}`);
      return cached.rate;
    }

    try {
      const dbRate = await this.prisma.exchangeRate.findUnique({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency,
            toCurrency,
          },
        },
      });

      if (dbRate && (!dbRate.validUntil || dbRate.validUntil > new Date())) {
        this.cache.set(cacheKey, { rate: dbRate.rate, timestamp: Date.now() });
        return dbRate.rate;
      }
    } catch (error) {
      this.logger.warn(`Database rate lookup failed: ${error.message}`);
    }

    try {
      const apiRate = await this.fetchFromAPI(fromCurrency, toCurrency);
      if (apiRate) {
        await this.saveRate(fromCurrency, toCurrency, apiRate, 'api');
        this.cache.set(cacheKey, { rate: apiRate, timestamp: Date.now() });
        return apiRate;
      }
    } catch (error) {
      this.logger.warn(`API fetch failed for ${fromCurrency}->${toCurrency}: ${error.message}`);
    }

    throw new Error(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
  }

  private async fetchFromAPI(from: string, to: string): Promise<number | null> {
    try {
      const response = await axios.get(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`,
        { timeout: 5000 }
      );
      
      if (response.data && response.data.rates && response.data.rates[to]) {
        return response.data.rates[to];
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rate: ${error.message}`);
      return null;
    }
  }

  async saveRate(fromCurrency: string, toCurrency: string, rate: number, source: string = 'manual'): Promise<void> {
    try {
      await this.prisma.exchangeRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency,
            toCurrency,
          },
        },
        update: {
          rate,
          source,
          updatedAt: new Date(),
          validFrom: new Date(),
        },
        create: {
          fromCurrency,
          toCurrency,
          rate,
          source,
        },
      });
      
      this.cache.delete(`${fromCurrency}_${toCurrency}`);
      this.logger.log(`Saved exchange rate: ${fromCurrency} -> ${toCurrency} = ${rate}`);
    } catch (error) {
      this.logger.error(`Failed to save exchange rate: ${error.message}`);
      throw error;
    }
  }

  async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ convertedAmount: number; rate: number }> {
    if (fromCurrency === toCurrency) {
      return { convertedAmount: amount, rate: 1 };
    }

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;
    
    return { convertedAmount: parseFloat(convertedAmount.toFixed(2)), rate };
  }
}