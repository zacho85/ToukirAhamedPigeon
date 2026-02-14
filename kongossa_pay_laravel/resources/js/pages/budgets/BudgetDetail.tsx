import { Breadcrumbs } from '@/components/breadcrumbs';
import { BudgetCategoryForm, ExpenseForm } from '@/components/forms';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Budget } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
  DollarSign,
  Edit,
  MoreHorizontal,
  PieChart,
  Plus,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';


interface BudgetDetailProps {
  budget: Budget;
}

export default function BudgetDetail({ budget }: BudgetDetailProps) {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const getPeriodBadgeColor = (period: string) => {
    switch (period) {
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-green-100 text-green-800';
      case 'yearly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Budget Management' },
    { label: 'Budgets', href: '/budgets' },
    { label: budget.name },
  ];

  return (
    <>
      <Head title={budget.name} />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{budget.name}</h1>
              <Badge
                variant="secondary"
                className={getPeriodBadgeColor(budget.period)}
              >
                {budget.period}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created on {new Date(budget.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2">
            <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  categories={budget.categories}
                  onSuccess={() => setShowExpenseForm(false)}
                  onCancel={() => setShowExpenseForm(false)}
                />
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/budgets/${budget.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Budget
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/budgets/${budget.id}/reports`}>
                    <PieChart className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Budget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${budget.total_amount.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {budget.period} budget limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${budget.is_over_budget ? 'text-red-600' : 'text-gray-900'
                }`}>
                ${budget.total_spent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {budget.usage_percentage.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              {budget.is_over_budget ? (
                <TrendingDown className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${budget.is_over_budget ? 'text-red-600' : 'text-green-600'
                }`}>
                ${(budget.total_amount - budget.total_spent).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {budget.is_over_budget ? 'Over budget' : 'Available to spend'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Usage</CardTitle>
            <CardDescription>
              Overall spending progress for this {budget.period} budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{budget.usage_percentage.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(budget.usage_percentage, 100)} className="h-3" />
              {budget.is_over_budget && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Over budget by ${(budget.total_spent - budget.total_amount).toLocaleString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Categories and Recent Expenses */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Categories */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Budget Categories</CardTitle>
                <CardDescription>
                  Spending limits by category
                </CardDescription>
              </div>
              <Dialog open={showCategoryForm} onOpenChange={setShowCategoryForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-3 w-3" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Budget Category</DialogTitle>
                  </DialogHeader>
                  <BudgetCategoryForm
                    budgetId={budget.id}
                    onSuccess={() => setShowCategoryForm(false)}
                    onCancel={() => setShowCategoryForm(false)}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budget.categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No categories created yet. Add your first category to start tracking expenses.
                  </p>
                ) : (
                  budget.categories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          {/* <p className="text-sm font-medium">
                            ${category.total_spent.toLocaleString()} / ${category.limit_amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {category.expenses_count} expenses
                          </p> */}
                        </div>
                      </div>
                      {/* <Progress
                        value={Math.min(category.usage_percentage, 100)}
                        className="h-2"
                      /> */}
                      {/* {category.is_over_limit && (
                        <p className="text-xs text-red-600">
                          Over limit by ${(category.total_spent - category.limit_amount).toLocaleString()}
                        </p>
                      )} */}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>
                  Latest spending activity
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/budgets/${budget.id}/expenses`}>
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {budget.expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No expenses recorded yet. Add your first expense to start tracking.
                  </p>
                ) : (
                  budget.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: expense.category.color }}
                        />
                        <div>
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.category.name} • {new Date(expense.expense_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium text-red-600">
                        -${expense.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
