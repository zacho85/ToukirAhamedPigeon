import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createBudgetCategory, updateBudgetCategory } from "@/api/budgetCategories";

const BudgetCategoryForm = ({ budgetId, category, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Populate form fields when editing
  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      // toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (category && category.id) {
        // ✅ Update existing category
        await updateBudgetCategory(category.id, { name: name.trim(), description: description.trim() });
        //toast({ title: "Category updated successfully" });
      } else {
        // ✅ Create new category
        if (!budgetId) throw new Error("Missing budget ID");
        await createBudgetCategory(budgetId, { name: name.trim(), description: description.trim() });
        toast({ title: "Category added successfully" });
      }

      // Notify parent to refresh categories only
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      dispatch(
        showToast({
          type: "success",
          message: category ? "Category updated successfully" : "Category added successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err) {
      console.error(err);
      // toast({
      //   title: "Error",
      //   description: err.response?.data?.message || err.message || "Something went wrong",
      //   variant: "destructive",
      // });
      dispatch(
        showToast({
          type: "error",
          message: err.response?.data?.message || err.message || "Something went wrong",
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
