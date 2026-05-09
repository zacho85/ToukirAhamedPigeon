import api from '@/lib/axios';

export const fetchTransactionHistory = async (filters: any) => {
 const { data } = await api.post("/transactions/history", filters);
  return data;
};

export const sendMoney = async (payload: {
  recipientId: number;
  amount: number;
  description?: string;
}) => {
  const response = await api.post('/transactions/send', payload);
  return response.data; // { success, message, transaction, updatedBalance }
};
