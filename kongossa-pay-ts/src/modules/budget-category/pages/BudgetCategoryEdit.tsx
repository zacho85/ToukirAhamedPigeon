// ✅ src/pages/BudgetCategoryEdit.tsx
import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import {
  getEditBudgetCategoryForm,
  updateBudgetCategory,
  getCreateBudgetCategoryForm,
} from "@/modules/budget/api";
import { getCurrentUser } from "@/modules/auth/api";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
interface Budget {
  id: number | string;
  name: string;
  totalAmount?: number;
}

interface FormState {
  budget_id: string;
  name: string;
  description: string;
  color: string;
  limit_amount: string;
}

interface ErrorsState {
  [key: string]: string;
}

interface Breadcrumb {
  label: string;
  url: string;
}

export default function EditBudgetCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [form, setForm] = useState<FormState>({
    budget_id: "",
    name: "",
    description: "",
    color: "#000000",
    limit_amount: "",
  });
  const [errors, setErrors] = useState<ErrorsState>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const breadcrumbs: Breadcrumb[] = [
    { label: "Home", url: "/" },
    { label: "Budget Categories", url: "/budget-categories" },
    { label: "Edit", url: `/budget-categories/${id}/edit` },
  ];

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        const [categoryData, createFormData] = await Promise.all([
          getEditBudgetCategoryForm(id!),
          getCreateBudgetCategoryForm(currentUser.id),
        ]);

        const category = categoryData?.data || categoryData;
        const budgetsList: Budget[] = createFormData?.budgets || createFormData?.data?.budgets || [];

        setBudgets(budgetsList);

        setForm({
          budget_id: category.budgetId?.toString() || "",
          name: category.name || "",
          description: category.description || "",
          color: category.color || "#000000",
          limit_amount: category.limitAmount?.toString() || "",
        });
      } catch (err) {
        console.error("Error fetching category edit data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: form.name,
        description: form.description,
        color: form.color,
        limitAmount: Number(form.limit_amount) || 0,
      };

      await updateBudgetCategory(form.budget_id, id!, payload);

      dispatch(
        showToast({
          type: "success",
          message: "Budget category updated successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      navigate("/budgets/categories");
    } catch (err: any) {
      console.error("Error updating category:", err);
      dispatch(
        showToast({
          type: "danger",
          message: err.message || "Failed to update budget category!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      setErrors(err.response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="Edit Budget Category" />

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Budget Category</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-10 text-muted-foreground">Loading...</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Budget Select */}
                <div className="space-y-2">
                  <Label htmlFor="budget_id">Budget</Label>
                  <Select
                    value={form.budget_id}
                    onValueChange={(value) => handleChange("budget_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      {budgets.map((budget) => (
                        <SelectItem key={budget.id} value={String(budget.id)}>
                          {budget.name}{" "}
                          <span className="text-sm text-muted-foreground ml-2">
                            ${budget.totalAmount ?? 0}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.budget_id && (
                    <p className="text-sm text-destructive">{errors.budget_id}</p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={form.name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange("name", e.target.value)
                    }
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full border border-gray-300 rounded-md p-2 outline-0"
                    placeholder="Enter category description"
                    value={form.description}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                      handleChange("description", e.target.value)
                    }
                  ></textarea>
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={form.color}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange("color", e.target.value)
                    }
                    className="h-10"
                  />
                  {errors.color && (
                    <p className="text-sm text-destructive">{errors.color}</p>
                  )}
                </div>

                {/* Limit */}
                <div className="space-y-2">
                  <Label htmlFor="limit_amount">Limit Amount</Label>
                  <Input
                    id="limit_amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter limit amount"
                    value={form.limit_amount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleChange("limit_amount", e.target.value)
                    }
                  />
                  {errors.limit_amount && (
                    <p className="text-sm text-destructive">{errors.limit_amount}</p>
                  )}
                </div>

                {/* Submit */}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Category"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
