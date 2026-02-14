import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@/components/dashboard/Breadcumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { toast } from "@/components/ui/useToast";
import { getCreateBudgetCategoryForm, createBudgetCategory } from "@/api/budgetCategories";
import { getCurrentUser } from "@/api/auth";
import { showToast } from "@/store/toastSlice";
import { useDispatch } from "react-redux";

export default function CreateBudgetCategoryPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({
    budget_id: "",
    name: "",
    description: "",
    type: "expense",
    color: "#000000",
    limit_amount: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const breadcrumbs = [
    { label: "Home", url: "/" },
    { label: "Budget Categories", url: "/budget-categories" },
    { label: "Create", url: "/budget-categories/create" },
  ];

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        const data = await getCreateBudgetCategoryForm(currentUser?.id);
        setBudgets(data?.budgets || []); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      // Convert frontend snake_case form to backend camelCase DTO
      const payload = {
        name: form.name,
        description: form.description,
        color: form.color,
        limitAmount: Number(form.limit_amount) || 0, // ✅ correct key name
      };

      await createBudgetCategory(form.budget_id, payload);
      dispatch(
        showToast({
          type: "success",
          message: "Budget category created successfully!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      navigate("/budget/categories");
    } catch (err) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: err.message || "Failed to create budget category!",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
      setErrors(err.response?.data?.errors || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Budget Category</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-10 text-muted-foreground">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="budget_id">Budget</Label>
                <Select
                  value={form.budget_id}
                  onValueChange={(value) => handleChange("budget_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgets.map((budget) => (
                      <SelectItem key={budget.id} value={String(budget.id)}>
                        {budget.name} <span className="text-sm text-muted-foreground ml-2">{budget.totalAmount}$</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.budget_id && <p className="text-sm text-destructive">{errors.budget_id}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-2 outline-0"
                  id="description"
                  placeholder="Enter category description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                ></textarea>
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={form.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="h-10"
                />
                {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="limit_amount">Limit Amount</Label>
                <Input
                  id="limit_amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter limit amount"
                  value={form.limit_amount}
                  onChange={(e) => handleChange("limit_amount", e.target.value)}
                />
                {errors.limit_amount && <p className="text-sm text-destructive">{errors.limit_amount}</p>}
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create Category"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}