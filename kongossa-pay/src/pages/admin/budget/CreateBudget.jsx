import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"; // or your custom toast if using ShadCN hook
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import { BudgetForm } from "@/components/dashboard/BudgetForm";

export default function CreateBudget() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success("Your new budget has been created successfully.");
    navigate("/budgets");
  };

  const handleCancel = () => {
    navigate("/budgets");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets", href: "/budgets" },
    { label: "Create Budget" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="max-w-2xl mx-auto mt-10">
        <BudgetForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
}
