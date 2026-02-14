// apis/auth.ts
import api from "@/lib/axios";

// Fetch logged-in user (authenticated)
export const getDashboardData = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};

export const getQRCode = async (id: string | number) => {
  const res = await api.get(`/auth/${id}/qr-code`);
  return res.data.qrCode;
};

export const regenerateQR = async (id: string | number) => {
  const res = await api.post(`/auth/${id}/qr-code/regenerate`);
  return res.data.qrCode;
};

export const getQRUser = async (qrCode: string) => {
  const res = await api.get(`/auth/qr-code/${qrCode}`);
  return res.data;
};
