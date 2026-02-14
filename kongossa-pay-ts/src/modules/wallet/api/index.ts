// src/api/paymentMethods.ts
import api from "@/lib/axios";

export const createSetupIntent = async () => {
  const res = await api.post("/payment-methods/setup-intent");
  return res.data;
};

export const attachPaymentMethod = async (
  paymentMethodId: string,
  meta?: {
    accountName?: string;
    bankName?: string;
  }
) => {
  const res = await api.post("/payment-methods/attach", {
    paymentMethodId,
    ...meta,
  });
  return res.data;
};

export const listPaymentMethods = async () => {
  const res = await api.get("/payment-methods");
  return res.data;
};

export const deletePaymentMethod = async (id: number) => {
  const res = await api.delete(`/payment-methods/${id}`);
  return res.data;
};

export const setDefaultPaymentMethod = async (id: number) => {
  const res = await api.patch(`/payment-methods/${id}/default`);
  return res.data;
};

export const createTopUpIntent = async (payload: {
  amount: number;
  paymentMethodId: string;
  remarks?: string;
}) => {
  const res = await api.post("/wallet-topup/intent", payload);
  return res.data;
};

export const getWalletStats = async () => {
  const res = await api.get('/wallet-topup/stats');
  console.log("res.data", res.data);
  return res.data;
};

export const getPlatformStats = async () => {
  const res = await api.get("/wallet-topup/platform/stats");
  return res.data;
};

export const requestPayout = async(amount: number) => {
  const res = await api.post('/wallet-payout/request', { amount });
  return res.data;
}
