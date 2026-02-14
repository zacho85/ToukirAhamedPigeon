import { Breadcrumbs } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head, Link } from '@inertiajs/react';
import {
  DollarSign,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  TrendingUp
} from 'lucide-react';
import React, { useState } from 'react';

interface Budget {
  id: number;
  name: string;
  period: 'weekly' | 'monthly' | 'yearly';
  total_amount: number;
  total_spent: number;
  categories_count: number;
  created_at: string;
  is_over_budget: boolean;
  usage_percentage: number;
}

interface BudgetsListProps {
  budgets: {
    data: Budget[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    period?: string;
    sort_by?: string;
    sort_direction?: string;
  };
}

export default function BudgetsList({ budgets, filters }: BudgetsListProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedPeriod, setSelectedPeriod] = useState(filters.period || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set('search', searchTerm);
    } else {
      url.searchParams.delete('search');
    }
    window.location.href = url.toString();
  };

  const handlePeriodFilter = (period: string) => {
    setSelectedPeriod(period);
    const url = new URL(window.location.href);
    if (period) {
      url.searchParams.set('period', period);
    } else {
      url.searchParams.delete('period');
    }
    window.location.href = url.toString();
  };

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
    { label: 'Budgets' },
  ];

  return (
    <>
      <Head title='Budgets' />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Budgets</h1>
            <p className="text-muted-foreground">
              Manage your spending limits and track your financial goals.
            </p>
          </div>
          <Button asChild>
            <Link href="/budgets/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search budgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </form>

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

        {/* Budget Grid */}
        {budgets.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No budgets found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {filters.search || filters.period
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first budget to track your spending."
                }
              </p>
              <Button asChild>
                <Link href="/budgets/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Budget
                </Link>
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
                        <Badge
                          variant="secondary"
                          className={getPeriodBadgeColor(budget.period)}
                        >
                          {budget.period}
                        </Badge>
                        <Badge variant="outline">
                          {budget.categories_count} categories
                        </Badge>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/budgets/${budget.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/budgets/${budget.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Budget
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Budget
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Budget Amount */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                        <p className="text-2xl font-bold">
                          ${budget.total_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Spent</p>
                        <p className={`text-lg font-semibold ${budget.is_over_budget ? 'text-red-600' : 'text-gray-900'
                          }`}>
                          ${budget.total_spent.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Usage</span>
                        <span className={`font-medium ${budget.is_over_budget ? 'text-red-600' : 'text-gray-900'
                          }`}>
                          {budget.usage_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.min(budget.usage_percentage, 100)}
                        className={`h-2 ${budget.is_over_budget ? 'bg-red-100' : ''}`}
                      />
                      {budget.is_over_budget && (
                        <div className="flex items-center gap-1 text-xs text-red-600">
                          <TrendingUp className="h-3 w-3" />
                          Over budget by ${(budget.total_spent - budget.total_amount).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Remaining Amount */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Remaining</span>
                      <span className={`font-medium ${budget.is_over_budget ? 'text-red-600' : 'text-green-600'
                        }`}>
                        ${(budget.total_amount - budget.total_spent).toLocaleString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" asChild className="flex-1">
                        <Link href={`/budgets/${budget.id}`}>
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/budgets/${budget.id}/expenses/create`}>
                          <Plus className="mr-2 h-3 w-3" />
                          Add Expense
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {budgets.last_page > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((budgets.current_page - 1) * budgets.per_page) + 1} to {
                Math.min(budgets.current_page * budgets.per_page, budgets.total)
              } of {budgets.total} budgets
            </p>
            <div className="flex gap-2">
              {budgets.current_page > 1 && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`?page=${budgets.current_page - 1}`}>
                    Previous
                  </Link>
                </Button>
              )}
              {budgets.current_page < budgets.last_page && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`?page=${budgets.current_page + 1}`}>
                    Next
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
