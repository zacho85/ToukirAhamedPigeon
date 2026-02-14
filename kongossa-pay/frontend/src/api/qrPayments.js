import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Create QR Payment
export const createQRPayment = async (data) => {
  const res = await api.post(`${API_BASE}/qr-payments`, data);
  return res.data;
};

// Get all QR payments (supports filters)
export const getQRPayments = async (params = {}) => {
  const res = await api.get(`${API_BASE}/qr-payments`, { params });
  return res.data;
};

// Get one QR payment
export const getQRPaymentById = async (id) => {
  const res = await api.get(`${API_BASE}/qr-payments/${id}`);
  return res.data;
};

// Update QR payment
export const updateQRPayment = async (id, data) => {
  const res = await api.patch(`${API_BASE}/qr-payments/${id}`, data);
  return res.data;
};

// Delete QR payment
export const deleteQRPayment = async (id) => {
  const res = await api.delete(`${API_BASE}/qr-payments/${id}`);
  return res.data;
};
