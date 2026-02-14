import api from "@/lib/axios";

// Create QR Payment
export const createQRPayment = async (data:any) => {
  const res = await api.post(`/qr-payments`, data);
  return res.data;
};

// Get all QR payments (supports filters)
export const getQRPayments = async (params:any) => {
  const res = await api.get(`/qr-payments`, { params });
  return res.data;
};

// Get one QR payment
export const getQRPaymentById = async (id:string) => {
  const res = await api.get(`/qr-payments/${id}`);
  return res.data;
};

// Update QR payment
export const updateQRPayment = async (id:string, data:any) => {
  const res = await api.patch(`/qr-payments/${id}`, data);
  return res.data;
};

// Delete QR payment
export const deleteQRPayment = async (id:string) => {
  const res = await api.delete(`/qr-payments/${id}`);
  return res.data;
};

export const payQRPayment = async (id: string, payload: any) => {
  const res = await api.post(`/qr-payments/${id}/pay`, payload);
  return res.data;
};
