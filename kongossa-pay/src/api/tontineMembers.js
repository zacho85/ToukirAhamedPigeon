import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createTontineMember = async (data) => {
  const res = await api.post(`${API_BASE}/tontine-members`, data);
  return res.data;
};

export const getTontineMembers = async () => {
  const res = await api.get(`${API_BASE}/tontine-members`);
  return res.data;
};

export const getTontineMemberById = async (id) => {
  const res = await api.get(`${API_BASE}/tontine-members/${id}`);
  return res.data;
};

export const updateTontineMember = async (id, data) => {
  const res = await api.patch(`${API_BASE}/tontine-members/${id}`, data);
  return res.data;
};

export const deleteTontineMember = async (id) => {
  const res = await api.delete(`${API_BASE}/tontine-members/${id}`);
  return res.data;
};

// ---------------------------
// Missing API calls added
// ---------------------------

export const getTontineMemberStats = async (id) => {
  const res = await api.get(`${API_BASE}/tontine-members/${id}/stats`);
  return res.data;
};

export const createTontineContribution = async (id, data) => {
  const res = await api.post(`${API_BASE}/tontine-members/${id}/contributions`, data);
  return res.data;
};
