import { NotFoundException } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

// Stored rates only (no network): the same defaults the service seeds on start.
const STORED: Record<string, number> = { USD_EUR: 0.92, EUR_USD: 1.09 };

function makeService() {
  const prisma = {
    exchangeRate: {
      findUnique: jest.fn(async ({ where }) => {
        const { fromCurrency, toCurrency } = where.fromCurrency_toCurrency;
        const rate = STORED[`${fromCurrency}_${toCurrency}`];
        return rate ? { rate, validUntil: null } : null;
      }),
      upsert: jest.fn(),
    },
  };
  const service = new ExchangeRateService(prisma as any, {} as any);
  // No network in tests: Frankfurter never answers.
  jest.spyOn(service as any, 'fetchFromAPI').mockResolvedValue(null);
  return service;
}

describe('ExchangeRateService CFA peg (1 EUR = 655.957 XAF/XOF)', () => {
  it('EUR -> XAF and XOF is the fixed peg', async () => {
    const s = makeService();
    expect(await s.getExchangeRate('EUR', 'XAF')).toBeCloseTo(655.957, 6);
    expect(await s.getExchangeRate('EUR', 'XOF')).toBeCloseTo(655.957, 6);
  });

  it('XAF -> EUR is the inverse', async () => {
    const s = makeService();
    expect(await s.getExchangeRate('XAF', 'EUR')).toBeCloseTo(1 / 655.957, 10);
  });

  it('USD -> XAF goes through the USD -> EUR rate', async () => {
    const s = makeService();
    expect(await s.getExchangeRate('USD', 'XAF')).toBeCloseTo(0.92 * 655.957, 6);
  });

  it('XAF -> USD (a MoMo top-up) goes through the EUR -> USD rate', async () => {
    const s = makeService();
    const { convertedAmount } = await s.convertAmount(10000, 'XAF', 'USD');
    expect(convertedAmount).toBeCloseTo((10000 / 655.957) * 1.09, 2); // 16.62
  });

  it('XAF <-> XOF is 1', async () => {
    const s = makeService();
    expect(await s.getExchangeRate('XAF', 'XOF')).toBe(1);
  });

  it('a pair with no rate is a 404, not a 500', async () => {
    const s = makeService();
    await expect(s.getExchangeRate('USD', 'GHS')).rejects.toBeInstanceOf(NotFoundException);
  });
});
