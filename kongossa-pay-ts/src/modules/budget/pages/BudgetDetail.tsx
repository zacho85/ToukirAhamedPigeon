// src/modules/budget-detail/BudgetDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DollarSign, Edit, Plus, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { getBudget, deleteExpense, deleteBudgetCategory } from "../api";

import BudgetCategoryForm from "@/modules/budget-category/components/BudgetCategoryForm";
import ExpenseForm from "@/modules/budget/components/ExpenseForm";
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
/* --------------------------- */
/* Type Definitions */
/* --------------------------- */
export interface Expense {
  id: string;
  title: string;
  amount: number;
  expense_date: string;            // required for ExpenseForm
  budget_category_id: string;      // required for ExpenseForm
  budgetCategoryName?: string;     // optional display
}

export interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
  expenses?: Expense[];
}

export interface Budget {
  id: string;
  name: string;
  period?: string;
  totalAmount?: number;
  categories?: BudgetCategory[];
}

/* --------------------------- */
/* Component */
/* --------------------------- */
const BudgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      if (!id) return;
      const data = await getBudget(id);
      setBudget(data);
    } catch (err: any) {
      dispatch(
        showToast({
          type: "danger",
          message: err.message || "Failed to load budget!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!id) return;
    if (!window.confirm("Delete this category?")) return;
    try {
      await deleteBudgetCategory(categoryId);
      fetchBudget();
      dispatch(
        showToast({
          type: "success",
          message: "Budget category deleted successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      dispatch(
        showToast({
          type: "danger",
          message: err.message || "Failed to delete budget category!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!id) return;
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(expenseId);
      setTimeout(fetchBudget, 500);
      dispatch(
        showToast({
          type: "success",
          message: "Expense deleted successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      dispatch(
        showToast({
          type: "danger",
          message: err.message || "Failed to delete expense!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!budget) return <div className="p-6 text-center text-muted">Budget not found</div>;

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets", href: "/budgets" },
    { label: budget.name || "Budget Detail" },
  ];

  // Map all expenses with required fields for ExpenseForm
  const allExpenses: Expense[] = budget.categories?.flatMap((cat) =>
    cat.expenses?.map((exp) => ({
      id: exp.id,
      title: exp.title,
      amount: exp.amount,
      expense_date: exp.expense_date || new Date().toISOString().split("T")[0],
      budget_category_id: cat.id,
      budgetCategoryName: cat.name,
    })) || []
  ) || [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title={budget.name || "Budget Detail"} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{budget.name}</h1>
            <p className="text-sm text-muted-foreground">
              {budget.period ? `Period: ${budget.period}` : "No period info"}
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>

        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <h3 className="font-medium">Total Categories</h3>
              <p>{budget.categories?.length || 0}</p>
            </div>
            <div>
              <h3 className="font-medium">Total Expenses</h3>
              <p>{allExpenses.length}</p>
            </div>
            <div>
              <h3 className="font-medium">Total Amount</h3>
              <p>${budget.totalAmount || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> Categories
            </h2>
            <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {budget.categories?.map((cat) => (
              <Card key={cat.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{cat.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Expenses
            </h2>
            <Button onClick={() => { setEditingExpense(null); setShowExpenseForm(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Expense
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {allExpenses.map((exp) => (
              <Card key={exp.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{exp.budgetCategoryName || "N/A"}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">${exp.amount}</Badge>
                    <Button size="icon" variant="ghost" onClick={() => { setEditingExpense(exp); setShowExpenseForm(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteExpense(exp.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{exp.title}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Dialog */}
        <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <BudgetCategoryForm
              budgetId={budget.id}
              category={editingCategory || undefined}
              onClose={() => setShowCategoryForm(false)}
              onSuccess={fetchBudget}
            />
          </DialogContent>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={showExpenseForm} onOpenChange={(open) => { setShowExpenseForm(open); if (!open) setEditingExpense(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              categories={budget.categories || []}
              expense={editingExpense || null}
              budgetCategoryId={editingExpense?.budget_category_id || undefined}
              onCancel={() => setShowExpenseForm(false)}
              onSuccess={async () => { await fetchBudget(); setShowExpenseForm(false); }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default BudgetDetail;
