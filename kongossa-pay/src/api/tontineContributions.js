import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// --------------------
// Existing functions
// --------------------
export const createTontineContribution = async (data) => {
  const res = await api.post(`${API_BASE}/tontine-contributions`, data);
  return res.data;
};

export const getTontineContributions = async (query = {}) => {
  const res = await api.get(`${API_BASE}/tontine-contributions`, { params: query });
  return res.data;
};

export const getTontineContributionById = async (id) => {
  const res = await api.get(`${API_BASE}/tontine-contributions/${id}`);
  return res.data;
};

export const updateTontineContribution = async (id, data) => {
  const res = await api.patch(`${API_BASE}/tontine-contributions/${id}`, data);
  return res.data;
};

export const deleteTontineContribution = async (id) => {
  const res = await api.delete(`${API_BASE}/tontine-contributions/${id}`);
  return res.data;
};

// --------------------
// New / Missing API functions
// --------------------

// Get statistics for a specific tontine
export const getTontineContributionStats = async (tontineId) => {
  const res = await api.get(`${API_BASE}/tontine-contributions/stats/tontine/${tontineId}`);
  return res.data;
};

// Mark a contribution as paid
export const markTontineContributionPaid = async (id) => {
  const res = await api.patch(`${API_BASE}/tontine-contributions/${id}/mark-paid`);
  return res.data;
};

// Mark a contribution as late
export const markTontineContributionLate = async (id) => {
  const res = await api.patch(`${API_BASE}/tontine-contributions/${id}/mark-late`);
  return res.data;
};

// Get all contributions for a specific tontine by its ID
export const getContributionsByTontine = async (tontineId) => {
  const res = await api.get(`${API_BASE}/tontine-contributions/tontine/${tontineId}`);
  return res.data;
};

// --------------------
// Tontine Members API
// --------------------

// Get all members for a specific tontine
export const getTontineMembers = async (tontineId) => {
  const res = await api.get(`${API_BASE}/tontine-members/tontine/${tontineId}`);
  return res.data;
};

// Add a member to a tontine
export const addTontineMember = async (tontineId, data) => {
  const res = await api.post(`${API_BASE}/tontine-members/tontine/${tontineId}`, data);
  return res.data;
};

// Update a tontine member
export const updateTontineMember = async (id, data) => {
  const res = await api.patch(`${API_BASE}/tontine-members/${id}`, data);
  return res.data;
};

// Delete a tontine member
export const deleteTontineMember = async (id) => {
  const res = await api.delete(`${API_BASE}/tontine-members/${id}`);
  return res.data;
};

export const stripeCheckoutSuccess = async (sessionId) => {
  const res = await api.get(`${API_BASE}/tontine-contributions/checkout/success`, {
    params: { sessionId },
  });
  return res;
};
