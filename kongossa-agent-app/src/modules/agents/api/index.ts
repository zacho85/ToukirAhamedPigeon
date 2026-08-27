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

export const cashIn = async (userEmail: string, amount: number, notes?: string) => {
  const res = await api.post("/agents/cash-in", { userEmail, amount, notes });
  return res.data.data;
};

export const cashOut = async (userEmail: string, amount: number, notes?: string) => {
  const res = await api.post("/agents/cash-out", { userEmail, amount, notes });
  return res.data.data;
};

export const confirmCashOut = async (transactionId: number, code: string) => {
  const res = await api.post(`/agents/cash-out/${transactionId}/confirm`, { code });
  return res.data.data;
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
