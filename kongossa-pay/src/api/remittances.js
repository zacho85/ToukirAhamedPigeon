import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createRemittance = async (data) => {
  const res = await api.post(`${API_BASE}/remittances`, data);
  return res.data;
};

// Filter remittances
export const filterRemittances = async (filters) => {
  const res = await api.post(`${API_BASE}/remittances/filter`, filters);
  return res.data;
};

export const getRemittanceById = async (id) => {
  const res = await api.get(`${API_BASE}/remittances/${id}`);
  return res.data;
};

export const updateRemittance = async (id, data) => {
  const res = await api.patch(`${API_BASE}/remittances/${id}`, data);
  return res.data;
};

export const deleteRemittance = async (id) => {
  const res = await api.delete(`${API_BASE}/remittances/${id}`);
  return res.data;
};
