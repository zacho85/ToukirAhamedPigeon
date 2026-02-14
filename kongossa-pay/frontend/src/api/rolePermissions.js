import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createRolePermission = async (data) => {
  const res = await api.post(`${API_BASE}/role-permissions`, data);
  return res.data;
};

export const getRolePermissions = async () => {
  const res = await api.get(`${API_BASE}/role-permissions`);
  return res.data;
};

export const getRolePermissionById = async (id) => {
  const res = await api.get(`${API_BASE}/role-permissions/${id}`);
  return res.data;
};

export const updateRolePermission = async (id, data) => {
  const res = await api.put(`${API_BASE}/role-permissions/${id}`, data);
  return res.data;
};

export const deleteRolePermission = async (id) => {
  const res = await api.delete(`${API_BASE}/role-permissions/${id}`);
  return res.data;
};
