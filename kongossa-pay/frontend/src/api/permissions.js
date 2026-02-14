import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createPermission = async (data) => {
  const res = await api.post(`${API_BASE}/permissions`, data);
  return res.data;
};

export const getPermissions = async () => {
  const res = await api.get(`${API_BASE}/permissions`);
  return res.data;
};

export const getPermissionById = async (id) => {
  const res = await api.get(`${API_BASE}/permissions/${id}`);
  return res.data;
};

export const updatePermission = async (id, data) => {
  const res = await api.patch(`${API_BASE}/permissions/${id}`, data);
  return res.data;
};

export const deletePermission = async (id) => {
  const res = await api.delete(`${API_BASE}/permissions/${id}`);
  return res.data;
};
