// api/index.ts - FULL UPDATED VERSION
import api from '@/lib/axios';

export interface CreatePaymentLinkData {
  type?: string;
  amount?: number;
  description?: string;
  currency?: string;
  expiresInDays?: number;
  customerEmail?: string;
  quantity?: number;
  // NEW subscription fields
  frequency?: 'daily' | 'weekly' | 'bi_monthly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
  customIntervalDays?: number;
  durationType?: 'recurring' | 'fixed_term' | 'fixed_payments' | 'end_date';
  durationMonths?: number;
  totalPayments?: number;
  endDate?: Date;
  // Multi-currency fields
  baseCurrency?: string;
  allowedCurrencies?: string[];
  autoConvert?: boolean;
}

export interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: 'active' | 'paid' | 'expired' | 'cancelled' | 'subscription_active' | 'subscription_cancelled' | 'subscription_completed' | 'partially_paid';
  paymentUrl: string;
  expiresAt: string | null;
  createdAt: string;
  stripeCheckoutUrl: string | null;
  type?: string;
  // Subscription fields
  frequency?: 'daily' | 'weekly' | 'bi_monthly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
  customIntervalDays?: number;  // ✅ Add this line
  durationType?: 'recurring' | 'fixed_term' | 'fixed_payments' | 'end_date';
  durationMonths?: number;
  totalPayments?: number | null;
  paymentsMade?: number;
  endDate?: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionInfo?: {
    frequency: string;
    duration: string;
    paymentsMade: number;
    totalPayments: number | null;
    isActive: boolean;
  };
  quantityTotal?: number | null;
  quantityUsed?: number;
}

export interface PublicPaymentLink {
  id: string;
  type?: string;
  amount: number | null;
  currency: string;
  description: string | null;
  merchantName: string;
  status: string;
  stripeCheckoutUrl: string;
  quantityRemaining?: number;
  subscriptionInfo?: {
    frequency: string;
    duration: string;
    paymentsMade: number;
    totalPayments: number | null;
    isActive: boolean;
  };
  // Multi-currency fields
  originalAmount?: number;
  originalCurrency?: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  exchangeRate?: number;
  availableCurrencies?: string[];
  exchangeRates?: Record<string, number>;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  country: string;
  flag: string;
  symbol: string;
}

export interface CurrenciesResponse {
  currencies: CurrencyInfo[];
}

export const createPaymentLink = async (data: CreatePaymentLinkData): Promise<PaymentLink> => {
  const res = await api.post('/payment-links', data);
  return res.data;
};

export const getMyPaymentLinks = async (): Promise<PaymentLink[]> => {
  const res = await api.get('/payment-links');
  return res.data;
};

export const getPaymentLinkById = async (id: string): Promise<PaymentLink> => {
  const res = await api.get(`/payment-links/${id}`);
  return res.data;
};

export const cancelPaymentLink = async (id: string): Promise<void> => {
  await api.delete(`/payment-links/${id}`);
};

export const getPublicPaymentLink = async (linkId: string): Promise<PublicPaymentLink> => {
  const res = await api.get(`/pay/${linkId}`);
  return res.data;
};

// Add exchange rate API calls
export const getExchangeRates = async (baseCurrency: string) => {
  const res = await api.get(`/exchange-rate/rate/${baseCurrency}/USD`);
  return res.data;
};

export const convertCurrency = async (amount: number, from: string, to: string) => {
  const res = await api.get(`/exchange-rate/convert/${from}/${to}/${amount}`);
  return res.data;
};

export const getCurrencies = async (): Promise<CurrenciesResponse> => {
  const res = await api.get('/exchange-rate/currencies');
  return res.data;
};