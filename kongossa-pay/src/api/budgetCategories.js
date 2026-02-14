// budgetCategories.js
import api from "../lib/axios";

const API_BASE = import.meta.env.VITE_APP_API_URL || "http://localhost:3000";

// ----------------------------
// Budget Categories API
// ----------------------------

export const getBudgetCategories = async () => {
  return api.get(`${API_BASE}/budget-categories`);
};

export const getBudgetCategory = async (id) => {
  return api.get(`${API_BASE}/budget-categories/${id}`);
};

export const createBudgetCategory = async (budgetId, data) => {
  return api.post(`${API_BASE}/budget-categories/${budgetId}/categories`, data);
};

export const updateBudgetCategory = async (id, data) => {
  return api.put(`${API_BASE}/budget-categories/${id}`, data);
};

export const deleteBudgetCategory = async (id) => {
  return api.delete(`${API_BASE}/budget-categories/${id}`);
};

export const getBudgetCategoryStats = async (id) => {
  return api.get(`${API_BASE}/budget-categories/${id}/stats`);
};

export const addExpenseToCategory = async (id, expenseData) => {
  return api.post(`${API_BASE}/budget-categories/${id}/expenses`, expenseData);
};

// Optional: for frontend forms if needed
export const getCreateBudgetCategoryForm = async (userId) => {
  const response = await api.get(`${API_BASE}/budget-categories/create?user_id=${userId}`);
  return response?.data?.data;
};

export const getEditBudgetCategoryForm = async (id) => {
  return api.get(`${API_BASE}/budget-categories/${id}/edit`);
};