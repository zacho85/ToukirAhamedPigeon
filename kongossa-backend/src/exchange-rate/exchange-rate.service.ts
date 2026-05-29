import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly apiUrl = 'https://open.er-api.com/v6/latest';

  async getRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.apiUrl}/${baseCurrency}`, {
        timeout: 5000,
      });

      if (response.data.result === 'success') {
        return response.data.rates;
      }
      throw new Error('Failed to fetch exchange rates');
    } catch (error) {
      this.logger.error('Exchange rate API error:', error);
      throw new Error('Exchange rate service unavailable');
    }
  }

  async convert(
    amount: number,
    from: string,
    to: string = 'USD',
  ): Promise<{
    originalAmount: number;
    originalCurrency: string;
    convertedAmount: number;
    targetCurrency: string;
    rate: number;
  }> {
    const rates = await this.getRates(from);
    const rate = rates[to] || 1;
    const converted = amount * rate;

    return {
      originalAmount: amount,
      originalCurrency: from,
      convertedAmount: Math.round(converted * 100) / 100,
      targetCurrency: to,
      rate,
    };
  }
}
