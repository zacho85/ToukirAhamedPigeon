// src/pages/BudgetCategoryEdit.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
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
} from "@/api/budgetCategories";
import { getCurrentUser } from "@/api/auth";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

export default function EditBudgetCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    budget_id: "",
    name: "",
    description: "",
    color: "#000000",
    limit_amount: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const breadcrumbs = [
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
          getEditBudgetCategoryForm(id), // existing category
          createFormDataForUser(currentUser.id),
        ]);

        const category = categoryData?.data || categoryData; // handle both plain and nested responses
        const budgetsList = createFormData?.budgets || createFormData?.data?.budgets || [];

        setBudgets(budgetsList);

        // ✅ Pre-fill form with existing data
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

    const createFormDataForUser = async (userId) => {
      const data = await import("@/api/budgetCategories").then((mod) =>
        mod.getCreateBudgetCategoryForm(userId)
      );
      return data;
    };

    fetchFormData();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        name: form.name,
        description: form.description,
        color: form.color,
        limitAmount: Number(form.limit_amount) || 0, // ✅ camelCase fix
      };

      await updateBudgetCategory(id, payload);
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
    } catch (err) {
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
    <div className="space-y-6 mt-10">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

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
                          ${budget.totalAmount}
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
                  onChange={(e) => handleChange("name", e.target.value)}
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
                  onChange={(e) => handleChange("description", e.target.value)}
                ></textarea>
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Color */}
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
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
                  onChange={(e) => handleChange("limit_amount", e.target.value)}
                />
                {errors.limit_amount && (
                  <p className="text-sm text-destructive">
                    {errors.limit_amount}
                  </p>
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
  );
}
