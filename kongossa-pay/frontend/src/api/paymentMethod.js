import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Create payment method
export const createPaymentMethod = async (data) => {
  const res = await api.post(`${API_BASE}/payment-methods`, data);
  return res.data;
};

// Get all user payment methods
export const getPaymentMethods = async ({ user_id }) => {
  const res = await api.get(`${API_BASE}/payment-methods`, {
    params: { user_id },
  });
  return res.data;
};

// Get single payment method
export const getPaymentMethodById = async (id) => {
  const res = await api.get(`${API_BASE}/payment-methods/${id}`);
  return res.data;
};

// Update payment method
export const updatePaymentMethod = async (id, data) => {
  const res = await api.patch(`${API_BASE}/payment-methods/${id}`, data);
  return res.data;
};

// Delete payment method
export const deletePaymentMethod = async (id) => {
  const res = await api.delete(`${API_BASE}/payment-methods/${id}`);
  return res.data;
};

// Set default method
export const setDefaultPaymentMethod = async (id) => {
  const res = await api.patch(`${API_BASE}/payment-methods/${id}/default`);
  return res.data;
};
