import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createTransaction = async (data) => {
  const res = await api.post(`${API_BASE}/transactions`, data);
  return res.data;
};

export const getTransactions = async () => {
  const res = await api.get(`${API_BASE}/transactions`);
  return res.data;
};

export const getTransactionById = async (id) => {
  const res = await api.get(`${API_BASE}/transactions/${id}`);
  return res.data;
};

export const updateTransaction = async (id, data) => {
  const res = await api.patch(`${API_BASE}/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id) => {
  const res = await api.delete(`${API_BASE}/transactions/${id}`);
  return res.data;
};
