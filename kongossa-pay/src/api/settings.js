import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const getProfile = async () => {
  const res = await api.get(`${API_BASE}/settings/profile`);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.patch(`${API_BASE}/settings/profile`, data);
  return res.data;
};

export const deleteProfile = async () => {
  const res = await api.delete(`${API_BASE}/settings/profile`);
  return res.data;
};

export const getPassword = async () => {
  const res = await api.get(`${API_BASE}/settings/password`);
  return res.data;
};

export const updatePassword = async (data) => {
  const res = await api.put(`${API_BASE}/settings/password`, data);
  return res.data;
};

export const getAppearanceSettings = async () => {
  const res = await api.get(`${API_BASE}/settings/appearance`);
  return res.data;
};