import { useNavigate } from "react-router-dom";
import { showToast } from "@/redux/slices/toastSlice"; 
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { BudgetForm } from "../components/BudgetForm";
import type { JSX } from "react";
import PageTransition from '@/components/module/admin/layout/PageTransition';
/* ------------------------------------ */
/* Types for Breadcrumbs and Handlers */
/* ------------------------------------ */
interface Breadcrumb {
  label: string;
  href?: string;
}

export default function CreateBudget(): JSX.Element {
  const navigate = useNavigate();

  /* --------------------------- */
  /* Handlers */
  /* --------------------------- */
  const handleSuccess = (): void => {
    showToast({
      type: "success",
      message: "Your new budget has been created successfully.",
    });
    navigate("/budgets");
  };

  const handleCancel = (): void => {
    navigate("/budgets");
  };

  /* --------------------------- */
  /* Breadcrumbs */
  /* --------------------------- */
  const breadcrumbs: Breadcrumb[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets", href: "/budgets" },
    { label: "Create Budget" },
  ];

  /* --------------------------- */
  /* Render */
  /* --------------------------- */
  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="Create Budget" />
        <div className="max-w-2xl mx-auto mt-10">
          <BudgetForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </PageTransition>
  );
}
