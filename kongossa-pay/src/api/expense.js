// src/api/expenses.js
import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// -----------------------------
// Expense API
// -----------------------------

// GET all expenses
export const getExpenses = async ({ params={} }) => {
  const res = await api.get(`${API_BASE}/expenses`, { params });
  return res.data;
};

// GET single expense by ID
export const getExpenseById = async (id) => {
  const res = api.get(`${API_BASE}/expenses/${id}`);
  return res.data;
};

// GET form data for creating expense
export const getExpenseCreateForm = async () => {
  const res = await api.get(`${API_BASE}/expenses/create`);
  return res.data;
};

// POST create new expense
export const createExpense = async (data) => {
  // Transform snake_case → camelCase for backend DTO
  const payload = {
    title: data.title,
    amount: data.amount,
    budgetCategoryId: data.budget_category_id, // ✅ renamed
    expenseDate: data.expense_date,             // ✅ renamed
    description: data.description || null,
  };

  const res = await api.post(`${API_BASE}/expenses`, payload);
  return res.data;
};

// PUT update expense by ID
export const updateExpense = async (id, data) => {

  const payload = {
  budgetCategoryId: Number(data.budget_category_id),
  title: data.title,
  amount: Number(data.amount),
  expenseDate: data.expense_date,
  description: data.description || null,
};

  const res = api.put(`${API_BASE}/expenses/${id}`, payload);
  return res.data;
};

// DELETE expense by ID
export const deleteExpense = async (id) => {
  const res = api.delete(`${API_BASE}/expenses/${id}`);
  return res.data;
};

// GET edit form for expense
export const getExpenseEditForm = async (id) => {
  const res = api.get(`${API_BASE}/expenses/${id}/edit`);
  return res.data;
};

// GET expenses by user
export const getExpensesByUser = async (userId) => {
  const res = api.get(`${API_BASE}/expenses/user/${userId}`);
  return res.data;
};

// GET user expense stats
export const getExpenseStatsByUser = async (userId) => {
  const res = api.get(`${API_BASE}/expenses/stats/user`, {
    params: { userId },
  });
  return res.data;
};