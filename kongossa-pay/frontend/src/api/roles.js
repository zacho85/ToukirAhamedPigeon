import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Create role
export const createRole = async (data) => {
  const res = await api.post(`${API_BASE}/roles`, data);
  return res.data;
};

// Get all roles
export const getAllRoles = async () => {
  const res = await api.get(`${API_BASE}/roles`);
  return res.data;
};

// Get role by ID
export const getRoleById = async (id) => {
  const res = await api.get(`${API_BASE}/roles/${id}`);
  return res.data;
};

// Update role
export const updateRole = async (id, data) => {
  const res = await api.patch(`${API_BASE}/roles/${id}`, data);
  return res.data;
};

// Delete role
export const deleteRole = async (id) => {
  const res = await api.delete(`${API_BASE}/roles/${id}`);
  return res.data;
};

// Assign role to user
export const assignRoleToUser = async (userId, roleId) => {
  const res = await api.post(`${API_BASE}/roles/assign`, { userId, roleId });
  return res.data;
};

// Remove role from user
export const removeRoleFromUser = async (userId, roleId) => {
  const res = await api.post(`${API_BASE}/roles/remove`, { userId, roleId });
  return res.data;
};

// Get user roles
export const getUserRoles = async (userId) => {
  const res = await api.get(`${API_BASE}/roles/user/${userId}`);
  return res.data;
};
