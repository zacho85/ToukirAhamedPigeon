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