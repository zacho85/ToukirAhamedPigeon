import api from "@/lib/axios";

// --------------------
// Existing functions
// --------------------
export const createTontineContribution = async (data: any) => {
  const res = await api.post(`/tontine-contributions`, data);
  return res.data;
};

export const getTontineContributions = async (query = {}) => {
  const res = await api.get(`/tontine-contributions`, { params: query });
  return res.data;
};

export const getTontineContributionById = async (id: number | string) => {
  const res = await api.get(`/tontine-contributions/${id}`);
  return res.data;
};

export const updateTontineContribution = async (id: number | string, data: any) => {
  const res = await api.patch(`/tontine-contributions/${id}`, data);
  return res.data;
};

export const deleteTontineContribution = async (id: number | string) => {
  const res = await api.delete(`/tontine-contributions/${id}`);
  return res.data;
};

// --------------------
// New / Missing API functions
// --------------------

// Get statistics for a specific tontine
export const getTontineContributionStats = async (tontineId: number | string) => {
  const res = await api.get(`/tontine-contributions/stats/tontine/${tontineId}`);
  return res.data;
};

// Mark a contribution as paid
export const markTontineContributionPaid = async (id: number | string) => {
  const res = await api.patch(`/tontine-contributions/${id}/mark-paid`);
  return res.data;
};

// Mark a contribution as late
export const markTontineContributionLate = async (id: number | string) => {
  const res = await api.patch(`/tontine-contributions/${id}/mark-late`);
  return res.data;
};

// Get all contributions for a specific tontine by its ID
export const getContributionsByTontine = async (tontineId: number | string) => {
  const res = await api.get(`/tontine-contributions/tontine/${tontineId}`);
  return res.data;
};

// --------------------
// Tontine Members API
// --------------------

// Get all members for a specific tontine
export const getTontineMembers = async (tontineId: number | string) => {
  const res = await api.get(`/tontine-members/tontine/${tontineId}`);
  return res.data;
};

// Add a member to a tontine
export const addTontineMember = async (tontineId: number | string, data: any) => {
  const res = await api.post(`/tontine-members/tontine/${tontineId}`, data);
  return res.data;
};

// Update a tontine member
export const updateTontineMember = async (id: number | string, data: any) => {
  const res = await api.patch(`/tontine-members/${id}`, data);
  return res.data;
};

// Delete a tontine member
export const deleteTontineMember = async (id: number | string) => {
  const res = await api.delete(`/tontine-members/${id}`);
  return res.data;
};

export const stripeCheckoutSuccess = async (sessionId: number | string) => {
  const res = await api.get(`/tontine-contributions/checkout/success`, {
    params: { sessionId },
  });
  return res;
};
