import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createUser = async (data) => {
  const res = await api.post(`${API_BASE}/users`, data);
  return res.data;
};

export const getUsers = async () => {
  const res = await api.get(`${API_BASE}/users`);
  return res.data;
};

export const getUserById = async (id) => {
  const res = await api.get(`${API_BASE}/users/${id}`);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await api.patch(`${API_BASE}/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`${API_BASE}/users/${id}`);
  return res.data;
};
