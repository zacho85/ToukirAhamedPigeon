// ✅ src/pages/CategoryDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { getBudgetCategory, deleteBudgetCategory } from "@/modules/budget/api";
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice"; 

// -----------------------------
// Types
// -----------------------------
interface Transaction {
  id: string | number;
  description: string;
  amount: number;
  date: string;
}

interface BudgetCategory {
  id: string | number;
  name: string;
  description: string;
  color: string;
  budget: number;
  spent: number;
  transactions?: Transaction[];
}

// -----------------------------
// Component
// -----------------------------
export default function BudgetCategoryShow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [category, setCategory] = useState<BudgetCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await getBudgetCategory(id!); // assuming axios returns { data: {...} }
      setCategory(response.data);
    } catch (err: any) {
      console.error("Failed to fetch category:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteBudgetCategory(id!);
      dispatch(
        showToast({
          type: "success",
          message: "Budget category deleted successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      navigate("/categories");
    } catch (err: any) {
      console.error("Failed to delete category:", err);
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

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Loading...</p>;
  }

  if (!category) {
    return <p className="text-center py-10 text-muted-foreground">Category not found</p>;
  }

  const spentPercentage = (category.spent / category.budget) * 100;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <RouterLink to="/categories">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </RouterLink>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
              <Badge
                style={{ backgroundColor: category.color }}
                className="h-8 w-8 rounded-full"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Budget Usage</span>
                  <span className="text-sm font-medium">
                    ${category.spent} / ${category.budget}
                  </span>
                </div>
                <Progress value={spentPercentage} className="h-2" />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" className="gap-2" onClick={handleDelete}>
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest spending in this category</CardDescription>
          </CardHeader>
          <CardContent>
            {category.transactions && category.transactions.length > 0 ? (
              <div className="space-y-4">
                {category.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <span className="font-semibold">${transaction.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No transactions found in this category
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
