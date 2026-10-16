import api from "@/lib/axios";

export const getMyAgentProfile = async () => {
  const res = await api.get("/agents/profile");
  return res.data.data;
};

// Safe for a pending/rejected agent to call (JwtAuthGuard only, no
// AgentGuard) -- returns null if the current user has no agent profile.
export const getMyStatus = async () => {
  const res = await api.get("/agents/my-status");
  return res.data.data;
};

export const getDashboardStats = async () => {
  const res = await api.get("/agents/dashboard/stats");
  return res.data.data;
};

export type DailyCommission = { date: string; transactions: number; commission: number };

export const getDailyCommission = async (days = 30) => {
  const res = await api.get("/agents/commission/daily", { params: { days } });
  return res.data.data as DailyCommission[];
};

export const getCurrentDay = async () => {
  const res = await api.get("/agents/day/current");
  return res.data.data;
};

export const getDayHistory = async () => {
  const res = await api.get("/agents/day/history");
  return res.data.data;
};

export const startDay = async (startCash: number) => {
  const res = await api.post("/agents/day/start", { startCash });
  return res.data.data;
};

export const endDay = async (endCash: number, notes?: string) => {
  const res = await api.post("/agents/day/end", { endCash, notes });
  return res.data.data;
};

/** `customer` is a KongossaPay ID, phone number (with country code) or email. */
export const cashIn = async (customer: string, amount: number, notes?: string) => {
  const res = await api.post("/agents/cash-in", { customer: customer.trim(), amount, notes });
  return res.data.data;
};

// A cash-out is started and approved by the customer in their own app; the
// agent only sees approved requests and confirms the cash hand-over.
export interface CashOutRequest {
  id: number;
  amount: number;
  commission: number;
  reference: string;
  notes: string | null;
  createdAt: string;
  expiresAt: string;
  customer: { fullName: string | null; email: string } | null;
}

export const getCashOutRequests = async () => {
  const res = await api.get("/agents/cash-out/requests");
  return res.data.data as CashOutRequest[];
};

export const completeCashOut = async (requestId: number) => {
  const res = await api.post(`/agents/cash-out/${requestId}/complete`);
  return res.data.data;
};

export const declineCashOut = async (requestId: number) => {
  const res = await api.post(`/agents/cash-out/${requestId}/decline`);
  return res.data.data;
};

/** Finds a customer by KongossaPay ID (KP100001), phone number (with country code) or email. */
export const lookupUser = async (query: string) => {
  const res = await api.get("/agents/lookup-user", { params: { q: query.trim() } });
  return res.data.data as {
    kongossaId: string;
    email: string;
    phoneNumber: string | null;
    fullName: string;
    active: boolean;
  };
};

export const transfer = async (
  sender: string,
  recipient: string,
  amount: number,
  notes?: string,
) => {
  const res = await api.post("/agents/transfer", { sender: sender.trim(), recipient: recipient.trim(), amount, notes });
  return res.data.data;
};

export const getMyTransaction = async (transactionId: number) => {
  const res = await api.get(`/agents/transactions/${transactionId}`);
  return res.data.data as { id: number; status: string };
};

export const getMyTransactions = async () => {
  const res = await api.get("/agents/transactions/mine");
  return res.data.data;
};

export const createFloatRequest = async (amount: number, notes?: string) => {
  const res = await api.post("/float-requests", { amount, notes });
  return res.data;
};

export const getMyFloatRequests = async () => {
  const res = await api.get("/float-requests/mine");
  return res.data;
};
