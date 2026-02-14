// apis/auth.ts
import api from "@/lib/axios";
import {
  FetchCsrfTokenApi,
  LoginApi,
  RefreshApi,
} from "@/routes/api";
import type {LoginResponse, RefreshResponse} from "./../types"

// Types for API responses
export const fetchCsrfTokenApi = async (): Promise<{ csrfToken: string }> => {
    const response = await api.get(FetchCsrfTokenApi.url, { withCredentials: true });
    return response.data; // { csrfToken: string }
};

export const loginApi = async (credentials: { identifier: string; password: string }): Promise<LoginResponse> => {
  const res = await api.post(LoginApi.url, credentials, {
    withCredentials: true,
  });
  return res.data;
};

export const refreshApi = async (): Promise<RefreshResponse> => {
  const response = await api.post(RefreshApi.url, {}, { withCredentials: true });
  return response.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const registerUser = async (formData:any) => {
  formData.delete("confirmPassword");
  const res = await api.post('/auth/register', formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const sendOtp = async (email: string, purpose = "login") => {
  const res = await api.post(`/auth/send-otp`, { email, purpose });
  return res.data;
};

// Resend OTP
export const resendOtp = async (email: string, purpose = "login") => {
  const res = await api.post(`/auth/resend-otp`, { email, purpose });
  return res.data;
};

export const verifyOtp = async (body: {
  email: string;
  code: string;
  purpose: string;
  rememberMe: boolean;
}) => {
  const res = await api.post(`auth/verify-otp`, body, {
    withCredentials: true,
  });
  return res.data;
};

// 🔹 Send Forgot Password Email
export const sendForgotPassword = async (email: string) => {
  const res = await api.post(`auth/forgot-password`, { email, domain: import.meta.env.VITE_APP_DOMAIN });
  return res.data;
};

// 🔹 Reset Password
export const resetPassword = async (token: string, password: string) => {
  const res = await api.post(`auth/reset-password`, { token, password });
  return res.data;
};

// 🔹 Set Password (for users setting a new password after OTP)
export const setPassword = async (password: string) => {
  const res = await api.patch("/auth/set-password", { password });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
