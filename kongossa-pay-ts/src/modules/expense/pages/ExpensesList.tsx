import { useEffect, useState } from "react";
import type {FormEvent } from "react";
import {
  Calendar,
  DollarSign,
  Receipt,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import Breadcrumbs from "@/components/module/admin/layout/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { getExpenses } from "@/modules/expense/api";
import { getBudgets } from "@/modules/budget/api";
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Can } from "@/components/custom/Can";
interface Budget {
  id: number;
  name: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  color?: string;
  budget?: Budget;
}

interface Expense {
  id: number;
  title: string;
  amount: number;
  createdAt: string;
  expenseDate: string;
  budgetCategory?: BudgetCategory;
}

export default function ExpensesList() {
  const navigate = useNavigate();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Expenses" },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const expenseData = await getExpenses({ params: { search: searchTerm } });
      const budgetDataResponse = await getBudgets();

      const expensesList: Expense[] = expenseData?.expenses || [];
      const budgets: any[] = budgetDataResponse?.data || [];

      const allCategories: BudgetCategory[] = budgets.flatMap((budget) =>
        budget.categories.map((c: any) => ({
          ...c,
          budget: { id: budget.id, name: budget.name },
        }))
      );

      setBudgetCategories(allCategories);
      setExpenses(expensesList);
    } catch (err) {
      console.error(err);
      setError("Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory && selectedCategory !== "all")
        params.append("category", selectedCategory);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const data = await getExpenses({ params });
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load filtered expenses.");
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = expenses.reduce((t, e) => t + +e.amount, 0);
  const avgExpense = expenses.length ? (totalAmount / expenses.length).toFixed(2) : "0";
  const topCategory = budgetCategories.length > 0 ? budgetCategories[0].name : "—";

  if (loading)
    return <div className="flex justify-center py-16 text-muted-foreground">Loading expenses...</div>;
  if (error)
    return (
      <PageTransition>
        <div className="text-center py-16 text-red-600">
          {error} <Button onClick={fetchData}>Retry</Button>
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>  
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbs} title="Expenses" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Expenses</h1>
            <p className="text-muted-foreground">
              Track and manage all your spending across different budget categories.
            </p>
          </div>
          <div className="flex gap-2">
            <Can anyOf={["create:expense"]}>
              <Button onClick={() => navigate("/expenses/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </Can>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalAmount}</div>
              <p className="text-xs text-muted-foreground">Current month spending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgExpense}</div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Category</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topCategory}</div>
              <p className="text-xs text-muted-foreground">Most spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {budgetCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name} ({category.budget?.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />

                  <Button type="submit">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses ({expenses.length})</CardTitle>
            <CardDescription>
              Your spending history with category and budget information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No expenses found</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Start tracking your spending by adding your first expense.
                </p>
                <Button onClick={() => navigate("/expenses/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Expense
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(expense.createdAt).toLocaleDateString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: expense.budgetCategory?.color || "#ccc" }}
                          />
                          <span>{expense.budgetCategory?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.budgetCategory?.budget?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-red-600">${expense.amount}</span>
                      </TableCell>
                      <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                      <TableCell>{/* Actions placeholder */}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
