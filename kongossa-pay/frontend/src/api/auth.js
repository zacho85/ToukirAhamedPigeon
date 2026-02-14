import axios from "axios";
import api from "../lib/axios"; // authenticated instance

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Register → sends OTP
export const registerUser = async (formData) => {
  const res = await axios.post(`${API_BASE}/auth/register`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  return res.data;
};

// Login → sends OTP
export const loginUser = async (data) => {
  const res = await axios.post(`${API_BASE}/auth/login`, data, {
    withCredentials: true,
  });
  return res.data;
};

// Send OTP
export const sendOtp = async (email, purpose = "login") => {
  const res = await axios.post(`${API_BASE}/auth/send-otp`, { email, purpose });
  return res.data;
};

// Resend OTP
export const resendOtp = async (email, purpose = "login") => {
  const res = await axios.post(`${API_BASE}/auth/resend-otp`, { email, purpose });
  return res.data;
};

// Verify OTP → returns accessToken + refreshToken (cookie) + user
export const verifyOtp = async (body) => {
  const res = await axios.post(`${API_BASE}/auth/verify-otp`, body, {
    withCredentials: true,
  });
  return res.data;
};

// Fetch logged-in user (authenticated)
export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// Send forgot password email
export const sendForgotPassword = async (email) => {
  const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email, domain: import.meta.env.VITE_APP_DOMAIN });
  return res.data;
};

// Reset password
export const resetPassword = async (token, password) => {
  const res = await axios.post(`${API_BASE}/auth/reset-password`, { token, password });
  return res.data;
};