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

export const addMpesaWallet = async (data: {
  accountName: string;
  phoneNumber: string;
  countryCode: string;
}) => {
  const res = await api.post("/payment-methods/mpesa", data);
  return res.data;
};

export const createMpesaTopUp = async (payload: {
  amount: number;
  paymentMethodId: number;
}) => {
  const res = await api.post("/wallet-topup/mpesa", payload);
  return res.data;
};

export const checkMpesaStatus = async (topUpId: number) => {
  const res = await api.get(`/wallet-topup/mpesa/${topUpId}/status`);
  return res.data;
};

export const addPaystackWallet = async (data: { accountName: string; countryCode?: string }) => {
  const res = await api.post('/payment-methods/paystack', data);
  return res.data;
};

export const addFlutterwaveWallet = async (data: { accountName: string; countryCode?: string }) => {
  const res = await api.post('/payment-methods/flutterwave', data);
  return res.data;
};

export const createPaystackTopUp = async (payload: { amount: number; paymentMethodId: number }) => {
  const res = await api.post('/wallet-topup/paystack', payload);
  return res.data;
};

export const checkPaystackStatus = async (topUpId: number) => {
  const res = await api.get(`/wallet-topup/paystack/${topUpId}/status`);
  return res.data;
};

export const createFlutterwaveTopUp = async (payload: { amount: number; paymentMethodId: number }) => {
  const res = await api.post('/wallet-topup/flutterwave', payload);
  return res.data;
};

export const checkFlutterwaveStatus = async (topUpId: number) => {
  const res = await api.get(`/wallet-topup/flutterwave/${topUpId}/status`);
  return res.data;
};

export const addAirtelMoneyWallet = async (data: {
  accountName: string;
  phoneNumber: string;
  countryCode: string;
}) => {
  const res = await api.post("/payment-methods/airtel", data);
  return res.data;
};

export const createAirtelTopUp = async (payload: {
  amount: number;
  paymentMethodId: number;
}) => {
  const res = await api.post("/wallet-topup/airtel", payload);
  return res.data;
};

export const checkAirtelStatus = async (topUpId: number) => {
  const res = await api.get(`/wallet-topup/airtel/${topUpId}/status`);
  return res.data;
};
/* ---------------- Agent requests (cash-out at an agent, agent-assisted transfer) ---------------- */

export interface AgentRequest {
  id: number;
  type: "cash_out" | "transfer";
  status: string; // pending_otp | awaiting_agent | completed | cancelled | declined | expired | failed
  amount: number;
  /** Platform fee paid on top, fixed when the request was made. */
  fee: number;
  /** amount + fee: what leaves the wallet. */
  total: number;
  reference: string;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
  agentName: string;
  recipient: { fullName: string | null; email: string } | null;
}

export const listAgentRequests = async () => {
  const res = await api.get("/agent-requests");
  return res.data.data as AgentRequest[];
};

export const getAgentRequest = async (id: number) => {
  const res = await api.get(`/agent-requests/${id}`);
  return res.data.data as AgentRequest;
};

export const startAgentCashOut = async (agentCode: string, amount: number) => {
  const res = await api.post("/agent-requests/cash-out", { agentCode, amount });
  return res.data.data as { id: number; reference: string; amount: number; status: string; agentName: string };
};

export const confirmAgentRequest = async (id: number, code: string) => {
  const res = await api.post(`/agent-requests/${id}/confirm`, { code });
  return res.data.data;
};

export const cancelAgentRequest = async (id: number) => {
  const res = await api.post(`/agent-requests/${id}/cancel`);
  return res.data.data as AgentRequest;
};
