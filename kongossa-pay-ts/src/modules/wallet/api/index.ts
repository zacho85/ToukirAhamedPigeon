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

export const addMomoWallet = async (data: {
  accountName: string;
  phoneNumber: string;
  countryCode: string;
}) => {
  const res = await api.post("/payment-methods/momo", data);
  return res.data;
};

export const addOrangeWallet = async (data: {
  accountName: string;
  phoneNumber: string;
  countryCode: string;
}) => {
  const res = await api.post("/payment-methods/orange", data);
  return res.data;
};

export const addTransfiWallet = async (data: {
  accountName: string;
  phoneNumber: string;
  countryCode: string;
}) => {
  const res = await api.post("/payment-methods/transfi", data);
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

export const createMoMoTopUp = async (payload: {
  amount: number;
  paymentMethodId: number;
}) => {
  const res = await api.post("/wallet-topup/momo", payload);
  return res.data;
};

export const checkMoMoStatus = async (topUpId: number) => {
  const res = await api.get(`/wallet-topup/momo/${topUpId}/status`);
  return res.data;
};

export const createOrangeTopUp = async (payload: {
  amount: number;
  paymentMethodId: number;
}) => {
  const res = await api.post("/wallet-topup/orange", payload);
  return res.data;
};

export const checkOrangeStatus = async (
  topUpId: number,
  payToken?: string,
) => {
  const params = payToken ? { payToken } : {};
  const res = await api.get(`/wallet-topup/orange/${topUpId}/status`, { params });
  return res.data;
};

export const createTransfiTopUp = async (payload: {
  amount: number;
  paymentMethodId: number;
}) => {
  const res = await api.post("/wallet-topup/transfi", payload);
  return res.data;
};

export const checkTransfiStatus = async (
  topUpId: number,
  orderId?: string,
) => {
  const params = orderId ? { orderId } : {};
  const res = await api.get(`/wallet-topup/transfi/${topUpId}/status`, { params });
  return res.data;
};

export const getWalletStats = async () => {
  const res = await api.get('/wallet-topup/stats');
  return res.data;
};

export const getPlatformStats = async () => {
  const res = await api.get("/wallet-topup/platform/stats");
  return res.data;
};

export const requestPayout = async (amount: number) => {
  const res = await api.post('/wallet-payout/request', { amount });
  return res.data;
};