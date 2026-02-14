import api from "@/lib/axios";

// ----------------------------
// Types (replace `any` later with real types)
// ----------------------------

export interface BudgetData {
  [key: string]: any;
}

export interface CategoryData {
  [key: string]: any;
}

export interface ExpenseData {
  [key: string]: any;
}

// ----------------------------
// Budget API Functions
// ----------------------------

export const getBudgets = async (
  options: any = {}
): Promise<any> => {
  const res = await api.get("/budgets", options);
  return res.data;
};

export async function createBudget(data: BudgetData): Promise<any> {
  const res = await api.post("/budgets", data);
  return res.data;
}

export async function getBudget(id: number | string): Promise<any> {
  const res = await api.get(`/budgets/${id}`);
  return res.data;
}

export async function updateBudget(
  id: number | string,
  data: BudgetData
): Promise<any> {
  const res = await api.put(`/budgets/${id}`, data);
  return res.data;
}

export async function deleteBudget(id: number | string): Promise<any> {
  const res = await api.delete(`/budgets/${id}`);
  return res.data;
}

// ----------------------------
// Budget Stats & Summary
// ----------------------------

export async function getBudgetStats(id: number | string): Promise<any> {
  const res = await api.get(`/budgets/${id}/stats`);
  return res.data;
}

export async function getBudgetSummary(id: number | string): Promise<any> {
  const res = await api.get(`/budgets/${id}/summary`);
  return res.data;
}

// ----------------------------
// Budget Categories
// ----------------------------

export async function createBudgetCategory(
  budgetId: number | string,
  data: CategoryData
): Promise<any> {
  const res = await api.post(`/budgets/${budgetId}/categories`, data);
  return res.data;
}

export async function getBudgetCategories(
): Promise<any> {
  const res = await api.get(`/budget-categories`);
  return res.data;
}

export async function getBudgetCategory(
  id: number | string
): Promise<any> {
  const res = await api.get(`/budget-categories/${id}`);
  return res.data;
}

export async function updateBudgetCategory(
  budgetId: number | string,
  categoryId: number | string,
  data: CategoryData
): Promise<any> {
  const res = await api.put(`/budgets/${budgetId}/categories/${categoryId}`, data);
  return res.data;
}

export async function deleteBudgetCategory(
  id: number | string
): Promise<any> {
  const res = await api.delete(`/budget-categories/${id}`);
  return res.data;
}

// ----------------------------
// Expenses
// ----------------------------

export async function createExpense(
  budgetId: number | string,
  categoryId: number | string,
  data: ExpenseData
): Promise<any> {
  const res = await api.post(
    `/budgets/${budgetId}/categories/${categoryId}/expenses`,
    data
  );
  return res.data;
}

export async function getExpenses(
  budgetId: number | string,
  categoryId: number | string
): Promise<any> {
  const res = await api.get(
    `/budgets/${budgetId}/categories/${categoryId}/expenses`
  );
  return res.data;
}

export async function updateExpense(
  budgetId: number | string,
  categoryId: number | string,
  expenseId: number | string,
  data: ExpenseData
): Promise<any> {
  const res = await api.put(
    `/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`,
    data
  );
  return res.data;
}

export async function deleteExpense(
  expenseId: number | string
): Promise<any> {
  const res = await api.delete(
    `/expenses/${expenseId}`
  );
  return res.data;
}

export const getCreateBudgetCategoryForm = async (userId: number | string) => {
  const response = await api.get(`/budget-categories/create?user_id=${userId}`);
  return response?.data?.data;
};

export const getEditBudgetCategoryForm = async (id: number | string) => {
  return api.get(`/budget-categories/${id}/edit`);
};
