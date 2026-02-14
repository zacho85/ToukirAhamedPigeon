import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Create float request
export const createFloatRequest = async (data) => {
  const res = await api.post(`${API_BASE}/float-requests`, data);
  return res.data;
};

// Get all float requests (with optional filters)
export const getFloatRequests = async (params = {}) => {
  const res = await api.get(`${API_BASE}/float-requests`, { params });
  return res.data;
};

// Get single float request
export const getFloatRequestById = async (id) => {
  const res = await api.get(`${API_BASE}/float-requests/${id}`);
  return res.data;
};

// Update float request
export const updateFloatRequest = async (id, data) => {
  const res = await api.patch(`${API_BASE}/float-requests/${id}`, data);
  return res.data;
};

// Delete float request
export const deleteFloatRequest = async (id) => {
  const res = await api.delete(`${API_BASE}/float-requests/${id}`);
  return res.data;
};
