import React, { useEffect, useRef, useState } from "react";
import { Plus, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBudget, updateBudget } from "../api";
import { showToast } from "@/redux/slices/toastSlice";
import { useDispatch } from "react-redux";

// -----------------------------
// Types
// -----------------------------
export interface BudgetItem {
  id?: string;
  name: string;
  period: string;
  totalAmount: number;
  description?: string;
}

interface BudgetFormProps {
  budget?: BudgetItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type ErrorMessages = {
  [key: string]: string | undefined;
};

// -----------------------------
// Options
// -----------------------------
const periodOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

// -----------------------------
// Component
// -----------------------------
export function BudgetForm({ budget, onSuccess, onCancel }: BudgetFormProps) {
  const dispatch = useDispatch();
  const isEditing = !!budget;
  const total_amountRef = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState({
    name: budget?.name || "",
    period: budget?.period || "monthly",
    totalAmount: budget?.totalAmount || 0,
  });

  // const [errors, setErrors] = useState<ErrorMessages>({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setData({
      name: budget?.name || "",
      period: budget?.period || "monthly",
      totalAmount: budget?.totalAmount || 0,
    });
  }, [budget]);

  const handleFocus = () => {
    if (data.totalAmount === 0) {
      setData((prev) => ({ ...prev, totalAmount: "" as any }));
    }
  };

  const handleChange = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    // setErrors({});

    try {
      if (isEditing && budget?.id) {
        await updateBudget(budget.id, data);
      } else {
        await createBudget(data);
      }

      onSuccess?.();

      dispatch(
        showToast({
          type: "success",
          message: isEditing
            ? "Budget updated successfully"
            : "Budget created successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      console.error(err);

      // if (err?.response?.data?.errors) {
      //   setErrors(err.response.data.errors);
      // }

      dispatch(
        showToast({
          type: "danger",
          message:
            err?.response?.data?.message ||
            err?.message ||
            "Something went wrong",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {isEditing ? "Edit Budget" : "Create New Budget"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your budget details below."
            : "Set up a new budget to track your spending and financial goals."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Monthly Budget, Travel Fund"
              required
            />
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Budget Period</Label>
            <Select
              value={data.period}
              onValueChange={(value) => handleChange("period", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select budget period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Total Amount */}
          <div className="space-y-2">
            <Label htmlFor="total_amount">Total Budget Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                ref={total_amountRef}
                id="total_amount"
                type="number"
                value={data.totalAmount}
                onChange={(e) =>
                  handleChange("totalAmount", parseFloat(e.target.value) || 0)
                }
                onFocus={handleFocus}
                placeholder="0.00"
                className="pl-8 w-full"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Budget" : "Create Budget"}
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={processing}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
