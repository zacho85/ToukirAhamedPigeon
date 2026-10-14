import api from "@/lib/axios";

export const getAllAgents = async (params: {
  status?: string;
  kycStatus?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) => {
  const res = await api.get("/agents/all", { params });
  return res.data;
};

export const getAgentById = async (id: number) => {
  const res = await api.get(`/agents/${id}`);
  return res.data.data;
};

export const approveAgent = async (
  id: number,
  status: "approved" | "rejected",
  rejectionReason?: string,
) => {
  const res = await api.patch(`/agents/${id}/approve`, { status, rejectionReason });
  return res.data;
};

export const suspendAgent = async (id: number, reason?: string) => {
  const res = await api.patch(`/agents/${id}/suspend`, { reason });
  return res.data;
};

export const activateAgent = async (id: number) => {
  const res = await api.patch(`/agents/${id}/activate`, {});
  return res.data;
};

export const updateCommission = async (id: number, commissionRate: number) => {
  const res = await api.patch(`/agents/${id}/commission`, { commissionRate });
  return res.data;
};

export const getFloatRequests = async (params: { agentId?: number; status?: string }) => {
  const res = await api.get("/float-requests", { params });
  return res.data;
};

export const reviewFloatRequest = async (
  id: number,
  status: "approved" | "rejected",
  notes?: string,
) => {
  const res = await api.patch(`/float-requests/${id}/review`, { status, notes });
  return res.data;
};

// ---- Limits, wallet adjustments, inventory (Milestone 3) ----

export type AgentLimits = {
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  maxTransactionAmount: number;
  maxCashOnHand: number;
};

export const updateLimits = async (id: number, limits: Partial<AgentLimits>) => {
  const res = await api.patch(`/agents/${id}/limits`, limits);
  return res.data as { message: string; warning?: string };
};


export type WalletAdjustment = {
  id: number;
  direction: "credit" | "debit";
  amount: number;
  reason: string;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  admin?: { fullName?: string; email?: string };
};

export const adjustWallet = async (
  id: number,
  direction: "credit" | "debit",
  amount: number,
  reason: string,
) => {
  const res = await api.post(`/agents/${id}/wallet-adjustments`, { direction, amount, reason });
  return res.data.data as WalletAdjustment;
};

export const getWalletAdjustments = async (id: number) => {
  const res = await api.get(`/agents/${id}/wallet-adjustments`);
  return res.data.data as WalletAdjustment[];
};

export type AgentInventory = {
  cashOnHand: number;
  maxCashOnHand: number;
  currentDay: null | {
    startedAt: string;
    startCash: number;
    totalCashIn: number;
    totalCashOut: number;
    totalCommission: number;
    transactions: number;
    expectedCash: number;
  };
};

export const getInventory = async (id: number) => {
  const res = await api.get(`/agents/${id}/inventory`);
  return res.data.data as AgentInventory;
};

export type DaySettlement = {
  id: number;
  settlementDate: string;
  status: string;
  startCash: number;
  totalCashIn: number;
  totalCashOut: number;
  expectedEndCash: number;
  endCash: number;
  variance: number;
};

export const getAgentDayHistory = async (id: number) => {
  const res = await api.get(`/agents/${id}/day/history`);
  return res.data.data as DaySettlement[];
};
