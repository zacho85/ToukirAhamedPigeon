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
  merchantName?: string;
}

export interface PublicPaymentLink {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  merchantName: string;
  status: string;
  stripeCheckoutUrl: string;
}

export interface CreatePaymentLinkFormData {
  amount: number;
  description: string;
  expiresInDays: number;
  customerEmail?: string;
}