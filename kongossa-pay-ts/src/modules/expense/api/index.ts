// GET form data for creating expense
import api from "@/lib/axios";

export const getExpenses = async ({ params={} }) => {
  const res = await api.get(`/expenses`, { params });
  return res.data;
};

// GET single expense by ID
export const getExpenseById = async (id: number | string) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data;
};

export const getExpenseCreateForm = async () => {
  const res = await api.get(`/expenses/create`);
  return res.data;
};

export const createExpense = async (data: any) => {
  // Transform snake_case → camelCase for backend DTO
  const payload = {
    title: data.title,
    amount: data.amount,
    budgetCategoryId: data.budget_category_id, // ✅ renamed
    expenseDate: data.expense_date,             // ✅ renamed
    description: data.description || null,
  };

  const res = await api.post(`/expenses`, payload);
  return res.data;
};

// PUT update expense by ID
export const updateExpense = async (expenseId: number | string, data: any) => {

  const payload = {
  budgetCategoryId: Number(data.budget_category_id),
  title: data.title,
  amount: Number(data.amount),
  expenseDate: data.expense_date,
  description: data.description || null,
};

  const res = await api.put(`/expenses/${expenseId}`, payload);
  return res.data;
};

// DELETE expense by ID
export const deleteExpense = async (expenseId: number | string) => {
  const res = await api.delete(`/expenses/${expenseId}`);
  return res.data;
};