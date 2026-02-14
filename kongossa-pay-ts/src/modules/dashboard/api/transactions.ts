import api from "@/lib/axios";

export const createTransaction = async (data: any) => {
  const res = await api.post(`/transactions`, data);
  return res.data;
};

export const getTransactions = async () => {
  const res = await api.get(`/transactions`);
  return res.data;
};

export const getTransactionById = async (id: string) => {
  const res = await api.get(`/transactions/${id}`);
  return res.data;
};

export const updateTransaction = async (id: string, data: any) => {
  const res = await api.patch(`/transactions/${id}`, data);
  return res.data;
};

export const deleteTransaction = async (id: string) => {
  const res = await api.delete(`/transactions/${id}`);
  return res.data;
};
