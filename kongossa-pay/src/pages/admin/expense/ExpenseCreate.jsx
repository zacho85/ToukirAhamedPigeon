// src/pages/ExpensesCreate.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import { getExpenseCreateForm } from "@/api/expense";
import { toast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { showToast } from "@/store/toastSlice"; 


export default function CreateExpense() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // ✅ Fetch all available budget categories from backend
  const fetchFormData = async () => {
    try {
      setLoading(true);
      const data = await getExpenseCreateForm();
      // Make sure the backend returns an array of categories under "budgetCategories"
      // Adjust this line if your key is different
      setCategories(data?.budgetCategories || []);
    } catch (err) {
      console.error("Failed to fetch expense form data:", err);
      // toast({
      //   title: "Failed to load form data",
      //   description: "Could not fetch available budget categories.",
      //   variant: "destructive",
      // });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  // ✅ Called after ExpenseForm successfully creates an expense
  const handleSuccess = async () => {
    // toast({
    //   title: "Expense Added",
    //   description: "Your expense has been recorded successfully.",
    // });
    dispatch(
      showToast({
        type: "success",
        message: "Expense Added",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      })
    );

    // Redirect user to expenses list or previous page
    navigate("/expenses");
  };

  // ✅ Cancel and return to Expenses page
  const handleCancel = () => {
    navigate("/expenses");
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Expenses", href: "/expenses" },
    { label: "Add Expense" },
  ];

  return (
    <div className="space-y-6 mt-10">
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

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
  );
}
