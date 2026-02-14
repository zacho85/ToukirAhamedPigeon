import { Breadcrumbs } from '@/components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BreadcrumbItem, DashboardProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  PieChart,
  Plus,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';

export default function Dashboard({ stats }: DashboardProps) {
  const budgetUsagePercentage = stats.budgets.totalAllocated > 0
    ? (stats.budgets.totalSpent / stats.budgets.totalAllocated) * 100
    : 0;

  const netTontineFlow = stats.tontines.totalReceived - stats.tontines.totalContributed;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' }
  ]
  return (
    <>
      <Head title='Dashboard' />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="space-y-8 mt-10">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here's an overview of your financial activities and tontine participation.
            </p>
          </div>
          <div className="flex gap-2">
            {/* <Button asChild>
              <Link href="/budgets/create">
                <Plus className="mr-2 h-4 w-4" />
                New Budget
              </Link>
            </Button> */}
            <Button variant="outline" asChild>
              <Link href={route("tontines.create")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tontine
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.budgets.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.budgets.active} active budgets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetUsagePercentage.toFixed(1)}%</div>
              <Progress value={budgetUsagePercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                ${stats.budgets.totalSpent.toLocaleString()} of ${stats.budgets.totalAllocated.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tontines</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tontines.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.tontines.total} total tontines
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tontine Net Flow</CardTitle>
              {netTontineFlow >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netTontineFlow >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {netTontineFlow >= 0 ? '+' : ''}${netTontineFlow.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                ${stats.tontines.totalReceived.toLocaleString()} received,
                ${stats.tontines.totalContributed.toLocaleString()} contributed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used actions to manage your finances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" size="lg" asChild className="h-auto p-6">
                <Link href="/expenses/create" className="flex flex-col items-center gap-2">
                  <DollarSign className="h-8 w-8" />
                  <span className="font-medium">Add Expense</span>
                  <span className="text-xs text-muted-foreground">Record new spending</span>
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="h-auto p-6">
                <Link href="/budgets/create" className="flex flex-col items-center gap-2">
                  <Target className="h-8 w-8" />
                  <span className="font-medium">Create Budget</span>
                  <span className="text-xs text-muted-foreground">Set spending limits</span>
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="h-auto p-6">
                <Link href="/tontines/create" className="flex flex-col items-center gap-2">
                  <Users className="h-8 w-8" />
                  <span className="font-medium">Start Tontine</span>
                  <span className="text-xs text-muted-foreground">Create savings group</span>
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild className="h-auto p-6">
                <Link href="/analytics" className="flex flex-col items-center gap-2">
                  <PieChart className="h-8 w-8" />
                  <span className="font-medium">View Reports</span>
                  <span className="text-xs text-muted-foreground">Analyze spending</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Upcoming Events */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Expenses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest spending activity</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/expenses" className="flex items-center gap-1">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentExpenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent expenses found
                  </p>
                ) : (
                  stats.recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.category} • {expense.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${expense.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Payouts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Payouts</CardTitle>
                <CardDescription>Your next tontine payouts</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/tontines" className="flex items-center gap-1">
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.upcomingPayouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming payouts
                  </p>
                ) : (
                  stats.upcomingPayouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{payout.tontine_name}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {payout.payout_date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${payout.amount.toLocaleString()}</p>
                      </div>
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