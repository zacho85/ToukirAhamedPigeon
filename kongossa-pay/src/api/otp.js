import axios from "axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Send OTP
export const sendOtp = async (data) => {
  const res = await axios.post(`${API_BASE}/otp/send`, data);
  return res.data;
};

// Verify OTP
export const verifyOtp = async (data) => {
  const res = await axios.post(`${API_BASE}/otp/verify`, data);
  return res.data;
};
