import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createTransactionLimit = async (data) => {
  const res = await api.post(`${API_BASE}/transaction-limits`, data);
  return res.data;
};

export const getTransactionLimits = async () => {
  const res = await api.get(`${API_BASE}/transaction-limits`);
  return res.data;
};

export const getTransactionLimitById = async (id) => {
  const res = await api.get(`${API_BASE}/transaction-limits/${id}`);
  return res.data;
};

export const updateTransactionLimit = async (id, data) => {
  const res = await api.patch(`${API_BASE}/transaction-limits/${id}`, data);
  return res.data;
};

export const deleteTransactionLimit = async (id) => {
  const res = await api.delete(`${API_BASE}/transaction-limits/${id}`);
  return res.data;
};
