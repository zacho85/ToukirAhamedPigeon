import api from "@/lib/axios";

export interface PaymentRequest {
  id: string;
  paymentUrl: string;
  amount?: number;
  currency: string;
  description?: string;
}

// Reuses the existing payment-links module as-is -- createPaymentLink(userId,
// dto) only ever checks req.user.userId, no merchant-flag/role gate, so an
// agent can call it with zero backend changes. Its response already includes
// a public paymentUrl (the same /pay/:linkId page the main consumer app
// serves), which is rendered here as a QR code for the customer to scan with
// their own phone -- no separate qr-payments scan-and-pay flow exists
// anywhere in the codebase to build against (confirmed: PendingQRPayments.tsx
// is dead, unrouted code, and QRCodeDialog's scanner resolves to a different,
// wallet-address based feature, not the QRPayment model).
export const createPaymentRequest = async (
  amount: number | undefined,
  description: string | undefined,
  currency: string,
): Promise<PaymentRequest> => {
  const res = await api.post("/payment-links", {
    type: amount ? "fixed_amount" : "flexible_amount",
    amount,
    description,
    currency,
  });
  return res.data;
};
