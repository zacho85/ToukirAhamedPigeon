import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBudgetCategories,
  deleteBudgetCategory,
} from "@/modules/budget/api";
import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Can } from "@/components/custom/Can";
// -----------------------------
// Types
// -----------------------------
interface BudgetCategory {
  id: number | string;
  name: string;
  color: string;
  limit_amount: number;
  description: string;
}

// -----------------------------
// Component
// -----------------------------
export default function BudgetCategoryList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets" },
  ];

  // -----------------------------
  // Fetch categories
  // -----------------------------
  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const data  = await getBudgetCategories();

      setCategories(data || []);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // -----------------------------
  // Delete category
  // -----------------------------
  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await deleteBudgetCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
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
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: err?.message || "Failed to delete budget category!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    }
  };

  // -----------------------------
  // Loading & Error
  // -----------------------------
  if (loading)
    return (
      <PageTransition>
        <div className="flex justify-center py-16 text-muted-foreground">
          Loading categories...
        </div>
      </PageTransition>
    );

  if (error)
    return (
      <PageTransition>
        <div className="text-center py-16 text-red-600">
          {error} <Button onClick={fetchCategories}>Retry</Button>
        </div>
      </PageTransition>
    );

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="Budget Categories" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Categories</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and track your financial goals.
          </p>
        </div>
        <Can anyOf={["create:budget-category"]}>
          <Button onClick={() => navigate("/budgets/categories/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </Can>
      </div>

      {/* Category Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Budget Limit</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                  No categories found. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <span style={{ color: category.color }}>{category.color}</span>
                  </TableCell>
                  <TableCell>
                    <Badge>${category.limit_amount}</Badge>
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Can anyOf={["update:budget-category"]}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/budgets/categories/${category.id}/edit`)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </Can>
                      <Can anyOf={["delete:budget-category"]}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </div>
    </PageTransition>
  );
}
