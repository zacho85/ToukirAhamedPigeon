import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Request password reset
export const requestPasswordReset = async (data) => {
  const res = await axios.post(`${API_BASE}/password-resets/request`, data);
  return res.data;
};

// Reset password
export const resetPassword = async (data) => {
  const res = await axios.post(`${API_BASE}/password-resets/reset`, data);
  return res.data;
};
