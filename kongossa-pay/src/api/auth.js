import axios from "axios";
import api from "../lib/axios"; // authenticated instance

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// Register → sends OTP
export const registerUser = async (formData) => {
  formData.delete("confirmPassword");
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

// Logout
export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

// 🔹 Refresh Token
export const refreshToken = async () => {
  const res = await axios.post(`${API_BASE}/auth/refresh-token`, {}, { withCredentials: true });
  return res.data;
};

// 🔹 Verify Email (basic endpoint)
export const verifyEmail = async () => {
  const res = await api.get("/auth/verify-email");
  return res.data;
};

// 🔹 Verify Email by ID + Hash
export const verifyEmailById = async (id, hash) => {
  const res = await api.get(`/auth/verify-email/${id}/${hash}`);
  return res.data;
};

// 🔹 Send Email Verification Notification
export const sendEmailVerificationNotification = async () => {
  const res = await api.post("/auth/email/verification-notification");
  return res.data;
};

// 🔹 Get Confirm Password Page (optional confirmation step)
export const getConfirmPassword = async () => {
  const res = await api.get("/auth/confirm-password");
  return res.data;
};

// 🔹 Confirm Password
export const confirmPassword = async (password) => {
  const res = await api.post("/auth/confirm-password", { password });
  return res.data;
};

// 🔹 Send Forgot Password Email
export const sendForgotPassword = async (email) => {
  const res = await axios.post(`${API_BASE}/auth/forgot-password`, { email, domain: import.meta.env.VITE_APP_DOMAIN });
  return res.data;
};

// 🔹 Reset Password
export const resetPassword = async (token, password) => {
  const res = await axios.post(`${API_BASE}/auth/reset-password`, { token, password });
  return res.data;
};

// 🔹 Set Password (for users setting a new password after OTP)
export const setPassword = async (password) => {
  const res = await api.patch("/auth/set-password", { password });
  return res.data;
};
