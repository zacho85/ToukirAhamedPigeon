import api from "../lib/axios";

// ----------------------------
// Budget API Functions
// ----------------------------

export const getBudgets = async (options = {}) => {
  const res = await api.get("/budgets", options); 
  return res.data;
};

export async function createBudget(data) {
  const res = await api.post("/budgets", data);
  return res.data;
}

export async function getBudget(id) {
  const res = await api.get(`/budgets/${id}`);
  return res.data;
}

export async function updateBudget(id, data) {
  const res = await api.put(`/budgets/${id}`, data);
  return res.data;
}

export async function deleteBudget(id) {
  const res = await api.delete(`/budgets/${id}`);
  return res.data;
}

// ----------------------------
// Budget Stats & Summary
// ----------------------------

export async function getBudgetStats(id) {
  const res = await api.get(`/budgets/${id}/stats`);
  return res.data;
}

export async function getBudgetSummary(id) {
  const res = await api.get(`/budgets/${id}/summary`);
  return res.data;
}

// ----------------------------
// Budget Categories
// ----------------------------

export async function createBudgetCategory(budgetId, data) {
  const res = await api.post(`/budgets/${budgetId}/categories`, data);
  return res.data;
}

export async function getBudgetCategories(budgetId) {
  const res = await api.get(`/budgets/${budgetId}/categories`);
  return res.data;
}

export async function getBudgetCategory(budgetId, categoryId) {
  const res = await api.get(`/budgets/${budgetId}/categories/${categoryId}`);
  return res.data;
}

export async function updateBudgetCategory(budgetId, categoryId, data) {
  const res = await api.put(`/budgets/${budgetId}/categories/${categoryId}`, data);
  return res.data;
}

export async function deleteBudgetCategory(budgetId, categoryId) {
  const res = await api.delete(`/budgets/${budgetId}/categories/${categoryId}`);
  return res.data;
}

// ----------------------------
// Expenses
// ----------------------------

export async function createExpense(budgetId, categoryId, data) {
  const res = await api.post(`/budgets/${budgetId}/categories/${categoryId}/expenses`, data);
  return res.data;
}

export async function getExpenses(budgetId, categoryId) {
  const res = await api.get(`/budgets/${budgetId}/categories/${categoryId}/expenses`);
  return res.data;
}

export async function updateExpense(budgetId, categoryId, expenseId, data) {
  const res = await api.put(
    `/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`,
    data
  );
  return res.data;
}

export async function deleteExpense(budgetId, categoryId, expenseId) {
  const res = await api.delete(
    `/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`
  );
  return res.data;
}
