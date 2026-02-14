import React, { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createBudgetCategory, updateBudgetCategory } from "@/modules/budget/api";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice";

interface Category {
  id?: string | number;
  name?: string;
  description?: string;
}

interface BudgetCategoryFormProps {
  budgetId?: string | number;
  category?: Category;
  onClose?: () => void;
  onSuccess?: () => void;
}

const BudgetCategoryForm: React.FC<BudgetCategoryFormProps> = ({
  budgetId,
  category,
  onClose,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (category) {
      setName(category.name ?? "");
      setDescription(category.description ?? "");
    } else {
      setName("");
      setDescription("");
    }
  }, [category]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      dispatch(
        showToast({
          type: "danger",
          message: "Name is required.",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      return;
    }

    setLoading(true);

    try {
      if (category?.id) {
        await updateBudgetCategory(budgetId as string | number, category.id, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        if (!budgetId) throw new Error("Missing budget ID");

        await createBudgetCategory(budgetId, {
          name: name.trim(),
          description: description.trim(),
        });
      }

      onSuccess?.();
      onClose?.();

      dispatch(
        showToast({
          type: "success",
          message: category ? "Category updated successfully" : "Category added successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: err?.response?.data?.message ?? err.message ?? "Something went wrong",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          placeholder="Enter category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Enter category description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (category ? "Updating..." : "Saving...") : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default BudgetCategoryForm;
