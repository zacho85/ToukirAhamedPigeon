import api from '@/lib/axios';

export interface CreatePaymentLinkData {
  amount: number;
  description?: string;
  currency?: string;
  expiresInDays?: number;
  customerEmail?: string;
}

export interface PaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: 'active' | 'paid' | 'expired' | 'cancelled';
  paymentUrl: string;
  expiresAt: string | null;
  createdAt: string;
  stripeCheckoutUrl: string | null;
}

// ✅ Add this type for public payment page
export interface PublicPaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  merchantName: string;
  status: string;
  stripeCheckoutUrl: string;
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

// Public API (no auth)
export const getPublicPaymentLink = async (linkId: string): Promise<PublicPaymentLink> => {
  const res = await api.get(`/pay/${linkId}`);
  return res.data;
};