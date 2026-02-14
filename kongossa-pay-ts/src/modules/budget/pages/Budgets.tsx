import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  DollarSign,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Breadcrumb from "@/components/module/admin/layout/Breadcrumb";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBudgets } from "../api";
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Can } from "@/components/custom/Can";
interface Budget {
  id: number | string;
  name: string;
  period: "weekly" | "monthly" | "yearly" | string;
  categories_count: number;
  totalAmount: number;
  total_spent: number;
  usage_percentage: number;
  is_over_budget: boolean;
}

interface BudgetsResponse {
  data: Budget[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export default function BudgetsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [budgets, setBudgets] = useState<BudgetsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(searchParams.get("period") || "");

  const currentPage = Number(searchParams.get("page")) || 1;

  // Fetch budgets from API
  const fetchBudgets = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        search: searchTerm || undefined,
        period: selectedPeriod === "all" ? undefined : selectedPeriod,
        page: currentPage,
      };
      const data = await getBudgets({ params });
      setBudgets(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) params.set("search", searchTerm);
      else params.delete("search");
      params.set("page", "1");
      setSearchParams(params);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSearch = (e?: FormEvent<HTMLButtonElement | HTMLFormElement>) => {
    e?.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePeriodFilter = (period: string) => {
    setSelectedPeriod(period);
    const params = new URLSearchParams(searchParams);
    if (period && period !== "all") params.set("period", period);
    else params.delete("period");
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const getPeriodBadgeColor = (period: string) => {
    switch (period) {
      case "weekly":
        return "bg-blue-100 text-blue-800";
      case "monthly":
        return "bg-green-100 text-green-800";
      case "yearly":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Budget Management" },
    { label: "Budgets" },
  ];

  // UI Rendering
  if (loading)
    return (
      <PageTransition>
        <div className="flex justify-center py-16 text-muted-foreground">
          Loading budgets...
        </div>
      </PageTransition>
    );

  if (error)
    return (
      <PageTransition>
        <div className="text-center py-16 text-red-600">
          {error} <Button onClick={fetchBudgets}>Retry</Button>
        </div>
      </PageTransition>
    );

  return (
    <PageTransition>
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbs} title="Budgets" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Budgets</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and track your financial goals.
          </p>
        </div>
        <Can anyOf={["create:budget"]}>
          <Button onClick={() => navigate("/budgets/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Budget
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search budgets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="button" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={handlePeriodFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      {!budgets?.data?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No budgets found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm || selectedPeriod
                ? "Try adjusting your search criteria or filters."
                : "Get started by creating your first budget to track your spending."}
            </p>
            <Button onClick={() => navigate("/budgets/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Budget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {budgets.data.map((budget) => (
            <Card key={budget.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{budget.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPeriodBadgeColor(budget.period)}>
                        {budget.period}
                      </Badge>
                      <Badge variant="outline">{budget.categories_count} categories</Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/budgets/${budget.id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <Can anyOf={["update:budget"]}>
                        <DropdownMenuItem
                          onClick={() => navigate(`/budgets/${budget.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Budget
                        </DropdownMenuItem>
                      </Can>
                      <Can anyOf={["delete:budget"]}>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Budget
                        </DropdownMenuItem>
                      </Can>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-2xl font-bold">
                        ${budget.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Spent</p>
                      <p
                        className={`text-lg font-semibold ${
                          budget.is_over_budget ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        ${budget.total_spent.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Usage</span>
                      <span
                        className={`font-medium ${
                          budget.is_over_budget ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {budget.usage_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(budget.usage_percentage, 100)}
                      className={`h-2 ${budget.is_over_budget ? "bg-red-100" : ""}`}
                    />
                    {budget.is_over_budget && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <TrendingUp className="h-3 w-3" />
                        Over budget by ${(
                          budget.total_spent - budget.totalAmount
                        ).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <span
                      className={`font-medium ${
                        budget.is_over_budget ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      ${(budget.totalAmount - budget.total_spent).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/budgets/${budget.id}`)}
                    >
                      <Eye className="mr-2 h-3 w-3" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/expenses/create`)}
                    >
                      <Plus className="mr-2 h-3 w-3" /> Add Expense
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {budgets && budgets.last_page && budgets.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(budgets.current_page - 1) * budgets.per_page + 1} to{" "}
            {Math.min(budgets.current_page * budgets.per_page, budgets.total)} of{" "}
            {budgets.total} budgets
          </p>
          <div className="flex gap-2">
            {budgets.current_page > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(budgets.current_page - 1)}
              >
                Previous
              </Button>
            )}
            {budgets.current_page < budgets.last_page && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(budgets.current_page + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
