import api from "../lib/axios";
const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

export const createSupportTicket = async (data) => {
  const res = await api.post(`${API_BASE}/support-tickets`, data);
  return res.data;
};

export const getSupportTickets = async (query = {}) => {
  const res = await api.get(`${API_BASE}/support-tickets`, { params: query });
  return res.data;
};

export const getSupportTicketById = async (id) => {
  const res = await api.get(`${API_BASE}/support-tickets/${id}`);
  return res.data;
};

export const updateSupportTicket = async (id, data) => {
  const res = await api.patch(`${API_BASE}/support-tickets/${id}`, data);
  return res.data;
};

export const deleteSupportTicket = async (id) => {
  const res = await api.delete(`${API_BASE}/support-tickets/${id}`);
  return res.data;
};
