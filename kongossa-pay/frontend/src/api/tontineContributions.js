import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

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
