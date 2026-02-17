import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { BudgetForm } from "@/modules/budget/components/BudgetForm";
import { getBudget } from "../api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
// import { showToast } from "@/redux/slices/toastSlice"; 
import PageTransition from '@/components/module/admin/layout/PageTransition';
// -----------------------------
// Types
// -----------------------------
export interface BudgetItem {
  id: string;
  name: string;
  period: string;
  totalAmount: number;
  description?: string;
  [key: string]: any; // for any extra dynamic fields
}

export default function EditBudget() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [budget, setBudget] = useState<BudgetItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch budget details
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setLoading(true);
        if (!id) {
          setError("Invalid budget ID.");
          return;
        }

        const data: BudgetItem = await getBudget(id);

        // Ensure required fields exist
        const normalized: BudgetItem = {
          ...data,
          period: data.period || "monthly",
          total_amount: data.total_amount || 0,
        };
        setBudget(normalized);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load budget details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();
  }, [id]);

  const handleSuccess = () => {
    // dispatch(
    //   showToast({
    //     type: "success",
    //     message: "Budget updated successfully!",
    //     position: "top-right",
    //     animation: "slide-right-in",
    //     duration: 4000,
    //   })
    // );
    if (id) navigate(`/budgets/${id}`);
  };

  const handleCancel = () => {
    if (id) navigate(`/budgets/${id}`);
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets", href: "/budgets" },
    { label: budget?.name || "Loading...", href: id ? `/budgets/${id}` : undefined },
    { label: "Edit" },
  ];

  if (loading)
    return (
      <PageTransition>
        <div className="flex justify-center items-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Loading budget details...
        </div>
      </PageTransition>
    );

  if (error)
    return (
      <PageTransition>
        <div className="text-center py-16 text-red-600">
          {error}
          <div className="mt-4">
            <Button onClick={() => navigate("/budgets")}>Back to Budgets</Button>
          </div>
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="Edit Budget" />
            <BudgetForm
              budget={budget}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
      </div>
    </PageTransition>
  );
}
