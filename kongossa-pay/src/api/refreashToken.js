import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createRefreshToken = async (data) => {
  const res = await api.post(`${API_BASE}/refresh-tokens`, data);
  return res.data;
};

export const getRefreshTokens = async () => {
  const res = await api.get(`${API_BASE}/refresh-tokens`);
  return res.data;
};

export const getRefreshTokenById = async (id) => {
  const res = await api.get(`${API_BASE}/refresh-tokens/${id}`);
  return res.data;
};

export const updateRefreshToken = async (id, data) => {
  const res = await api.patch(`${API_BASE}/refresh-tokens/${id}`, data);
  return res.data;
};

export const deleteRefreshToken = async (id) => {
  const res = await api.delete(`${API_BASE}/refresh-tokens/${id}`);
  return res.data;
};
