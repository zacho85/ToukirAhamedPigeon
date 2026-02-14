import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import { BudgetForm } from "@/components/dashboard/BudgetForm";
import { getBudget } from "@/api/budget";
import { toast } from "@/components/ui/use-toast"; 
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 

export default function EditBudget() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch budget details
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setLoading(true);
        const data = await getBudget(id);
        setBudget(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load budget details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBudget();
  }, [id]);

  const handleSuccess = () => {
    dispatch(
      showToast({
        type: "success",
        message: "Budget updated successfully!",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      })
    );
    navigate(`/budgets/${id}`);
  };

  const handleCancel = () => {
    navigate(`/budgets/${id}`);
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets", href: "/budgets" },
    { label: budget?.name || "Loading...", href: `/budgets/${id}` },
    { label: "Edit" },
  ];

  if (loading)
    return (
      <div className="flex justify-center items-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Loading budget details...
      </div>
    );

  if (error)
    return (
      <div className="text-center py-16 text-red-600">
        {error}
        <div className="mt-4">
          <Button onClick={() => navigate("/budgets")}>Back to Budgets</Button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

      <Card className="max-w-2xl mx-auto">
        <CardContent>
          <BudgetForm
            budget={budget}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
