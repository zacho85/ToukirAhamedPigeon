// ✅ src/pages/ExpensesCreate.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import ExpenseForm from "@/modules/budget/components/ExpenseForm";
import { getExpenseCreateForm } from "../api";
import { useDispatch } from "react-redux";
// import { showToast } from "@/redux/slices/toastSlice";
import PageTransition from '@/components/module/admin/layout/PageTransition';
// ----------------------------
// Types
// ----------------------------
interface Category {
  id: string | number;
  name: string;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

// ----------------------------
// Component
// ----------------------------
export default function CreateExpense() {
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch available budget categories from backend
  const fetchFormData = async () => {
    try {
      setLoading(true);
      const data = await getExpenseCreateForm();
      // Adjust according to backend response structure
      setCategories(data?.budgetCategories || []);
    } catch (err) {
      console.error("Failed to fetch expense form data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  // Called after ExpenseForm successfully creates an expense
  const handleSuccess = () => {
    // dispatch(
    //   showToast({
    //     type: "success",
    //     message: "Expense Added",
    //     position: "top-right",
    //     animation: "slide-right-in",
    //     duration: 4000,
    //   })
    // );

    navigate("/expenses");
  };

  // Cancel and return to Expenses page
  const handleCancel = () => {
    navigate("/expenses");
  };

  const breadcrumbs: Breadcrumb[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Expenses", href: "/expenses" },
    { label: "Add Expense" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {breadcrumbs && <Breadcrumb items={breadcrumbs} title="Add Expense" />}

        <div className="max-w-2xl mx-auto mt-6">
          <h1 className="text-3xl font-bold mb-2">Add Expense</h1>
          <p className="text-muted-foreground mb-6">
            Record your new expense under the correct budget category.
          </p>

          {loading ? (
            <p className="text-center py-10 text-muted-foreground">Loading...</p>
          ) : (
            <ExpenseForm
              categories={categories}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
}
