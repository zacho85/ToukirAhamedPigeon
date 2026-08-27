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
