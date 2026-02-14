import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createTontine = async (data) => {
  const res = await api.post(`${API_BASE}/tontines`, data);
  return res.data;
};

export const getTontines = async (params = {}) => {
  const res = await api.get(`${API_BASE}/tontines`, { params });
  return res.data;
};

export const getTontineById = async (id) => {
  const res = await api.get(`${API_BASE}/tontines/${id}`);
  return res.data;
};

export const updateTontine = async (id, data) => {
  const res = await api.patch(`${API_BASE}/tontines/${id}`, data);
  return res.data;
};

export const deleteTontine = async (id) => {
  const res = await api.delete(`${API_BASE}/tontines/${id}`);
  return res.data;
};
