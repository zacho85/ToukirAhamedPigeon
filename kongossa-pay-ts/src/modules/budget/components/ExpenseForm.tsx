// src/modules/budget/components/ExpenseForm.tsx
import { useState, useEffect, useRef, type FormEvent } from "react";
import { format } from "date-fns";
import { Calendar, Loader2, Receipt, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";
import InputError from "@/components/custom/InputError";
import { createExpense, updateExpense } from "@/modules/expense/api";

// -------------------------
// Types
// -------------------------
interface Category {
  id: number | string;
  name: string;
  color?: string;
  limit_amount?: number;
}

interface Expense {
  id: number | string;
  title: string;
  amount: number;
  expense_date: string;
  budget_category_id: number | string;
}

interface FormDataState {
  budget_category_id: number | null;
  title: string;
  amount: number | string;
  expense_date: string;
}

interface ExpenseFormProps {
  categories?: Category[];
  expense?: Expense | null;
  budgetCategoryId?: number | string | null;
  onSuccess?: () => void | Promise<void>;
  onCancel?: () => void;
}

// -------------------------
// Component
// -------------------------
export default function ExpenseForm({
  categories = [],
  expense = null,
  budgetCategoryId = null,
  onSuccess,
  onCancel,
}: ExpenseFormProps) {
  const dispatch = useDispatch();
  const isEditing = !!expense;
  const today = format(new Date(), "yyyy-MM-dd");
  const amountRef = useRef<HTMLInputElement | null>(null);

  // -------------------------
  // State
  // -------------------------
  const [formData, setFormData] = useState<FormDataState>({
    budget_category_id: budgetCategoryId
      ? Number(budgetCategoryId)
      : expense?.budget_category_id
        ? Number(expense.budget_category_id)
        : null,
    title: expense?.title || "",
    amount: expense?.amount || "",
    expense_date: expense?.expense_date
      ? format(new Date(expense.expense_date), "yyyy-MM-dd")
      : today,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // -------------------------
  // Sync on edit
  // -------------------------
  useEffect(() => {
    setFormData({
      budget_category_id: budgetCategoryId
        ? Number(budgetCategoryId)
        : expense?.budget_category_id
          ? Number(expense.budget_category_id)
          : null,
      title: expense?.title || "",
      amount: expense?.amount || "",
      expense_date: expense?.expense_date
        ? format(new Date(expense.expense_date), "yyyy-MM-dd")
        : today,
    });
  }, [expense, budgetCategoryId]);

  // -------------------------
  // Handlers
  // -------------------------
  const handleChange = (field: keyof FormDataState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmountFocus = () => {
    if (amountRef.current && amountRef.current.value === "0") {
      amountRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (!formData.budget_category_id) {
        throw new Error("Please select a budget category");
      }

      const payload = {
        title: formData.title,
        amount: Number(formData.amount),
        budget_category_id: formData.budget_category_id,
        expense_date: formData.expense_date,
      };

      if (isEditing) {
        await updateExpense(expense!.id, payload);
      } else {
        await createExpense(payload);
      }

      await onSuccess?.();

      dispatch(
        showToast({
          type: "success",
          message: isEditing
            ? "Expense updated successfully"
            : "Expense created successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      if (apiErrors) setErrors(apiErrors);

      dispatch(
        showToast({
          type: "danger",
          message: apiMessage,
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------
  // Selected category
  // -------------------------
  const selectedCategory =
    categories.find(
      (c) => Number(c.id) === Number(formData.budget_category_id)
    ) || null;

  // -------------------------
  // Render
  // -------------------------
  return (
    <div className="space-y-6 mt-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Update your expense details below."
              : "Record a new expense to track your spending against your budget."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Select */}
            {!budgetCategoryId && (
              <div className="space-y-2">
                <Label>Budget Category</Label>
                <Select
                  value={
                    formData.budget_category_id
                      ? String(formData.budget_category_id)
                      : ""
                  }
                  onValueChange={(value) =>
                    handleChange("budget_category_id", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a budget category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: cat.color || "#3b82f6",
                            }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.budget_category_id} />
              </div>
            )}

            {/* Selected Category */}
            {budgetCategoryId && selectedCategory && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <Label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Category
                </Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: selectedCategory.color || "#3b82f6",
                    }}
                  />
                  <span className="font-medium">
                    {selectedCategory.name}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    ${selectedCategory.limit_amount || 0} limit
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>Expense Description</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  handleChange("title", e.target.value)
                }
                placeholder="e.g., Grocery, Gas, Restaurant"
                required
              />
              <InputError message={errors.title} />
            </div>

            {/* Amount + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    ref={amountRef}
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      handleChange(
                        "amount",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    onFocus={handleAmountFocus}
                    className="pl-8"
                    min={0}
                    step="0.01"
                    required
                  />
                </div>
                <InputError message={errors.amount} />
              </div>

              <div className="space-y-2">
                <Label>Expense Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                  <Input
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) =>
                      handleChange("expense_date", e.target.value)
                    }
                    className="pl-10"
                    max={today}
                    required
                  />
                </div>
                <InputError message={errors.expense_date} />
              </div>
            </div>

            {/* Expense Summary */}
<div className="rounded-lg border bg-muted/50 p-4">
  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
    Expense Summary
  </Label>

  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-sm">Description:</span>
      <span className="font-medium">
        {formData.title || "N/A"}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-sm">Amount:</span>
      <span className="font-bold text-lg">
        ${Number(formData.amount || 0).toFixed(2)}
      </span>
    </div>

    <div className="flex justify-between">
      <span className="text-sm">Date:</span>
      <span className="font-medium">
        {formData.expense_date
          ? format(new Date(formData.expense_date), "MMM dd, yyyy")
          : "N/A"}
      </span>
    </div>

    {selectedCategory && (
      <div className="flex justify-between">
        <span className="text-sm">Category:</span>
        <span className="font-medium">
          {selectedCategory.name}
        </span>
      </div>
    )}
  </div>
</div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? "Update Expense" : "Add Expense"}
                  </>
                )}
              </Button>

              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
