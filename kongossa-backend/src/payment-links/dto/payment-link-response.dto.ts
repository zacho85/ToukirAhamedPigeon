export class PaymentLinkResponseDto {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  status: string;
  paymentUrl: string;
  expiresAt: Date | null;
  createdAt: Date;
  stripeCheckoutUrl: string | null;
}