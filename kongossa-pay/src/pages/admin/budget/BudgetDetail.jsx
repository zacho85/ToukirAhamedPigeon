import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DollarSign, Edit, Plus, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

import { getBudget } from "@/api/budget";
import { deleteExpense } from "@/api/expense";
import { deleteBudgetCategory } from "@/api/budgetCategories";

import BudgetCategoryForm from "@/components/dashboard/BudgetCategoryForm";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

const BudgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const data = await getBudget(id);
      setBudget(data);
    } catch (err) {
      toast({
        title: "Error loading budget",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [id]);

  const handleDeleteCategory = async (categoryId) => {
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
    } catch (err) {
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

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(expenseId);
      toast({ title: "Expense deleted" });
      setTimeout(() => {
        fetchBudget();
        dispatch(
          showToast({
            type: "success",
            message: "Expense deleted successfully!",
            position: "top-right",
            animation: "slide-right-in",
            duration: 4000,
          })
        );
      }, 500);
    } catch (err) {
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
    { label: budget?.name || "Budget Detail" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{budget.name}</h1>
          <p className="text-sm text-muted-foreground">
            {budget.period ? `Period: ${budget.period}` : "No period info"}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
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
            <p>
              {budget.categories?.reduce(
                (acc, cat) => acc + (cat.expenses?.length || 0),
                0
              ) || 0}
            </p>
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
          <Button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {budget.categories?.map((cat) => (
            <Card key={cat.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{cat.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingCategory(cat);
                      setShowCategoryForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
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
          <Button
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {budget.expenses?.map((exp) => (
            <Card key={exp.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{exp.budgetCategoryName || "N/A"}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">${exp.amount}</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingExpense(exp);
                      setShowExpenseForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteExpense(exp.id)}
                  >
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
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <BudgetCategoryForm
            budgetId={budget.id}
            category={editingCategory}
            onClose={() => setShowCategoryForm(false)}
            onSuccess={fetchBudget}
          />
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog
        open={showExpenseForm}
        onOpenChange={(open) => {
          setShowExpenseForm(open);
          if (!open) setEditingExpense(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </DialogTitle>
          </DialogHeader>
          <ExpenseForm
            budgetId={budget.id}
            categories={budget.categories || []}
            expense={editingExpense}
            budgetCategoryId={editingExpense?.budgetCategoryId || null}
            onCancel={() => setShowExpenseForm(false)}
            onSuccess={() => {
               setTimeout(() => {
                 fetchBudget();
               }, 500);
              setShowExpenseForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetDetail;
