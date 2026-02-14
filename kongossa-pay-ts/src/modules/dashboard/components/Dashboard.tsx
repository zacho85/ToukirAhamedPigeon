import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  PieChart,
  Plus,
  QrCode,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import ScanQrSendMoneyDialog from "@/modules/dashboard/components/ScanQrSendMoneyDialog";

import { useTranslations } from "@/hooks/useTranslations";
import { getCurrentUser } from "@/modules/auth/api";
import { getDashboardData } from "@/modules/dashboard/api";
import { Can } from "@/components/custom/Can";
import RecentTransactions from "./RecentTransactions";
import BalanceCard from "./BalanceCard";
import QuickActionsGrid from "./QuickActionsGrid";
import TransactionChart from "./TransactionChart";
import type { User } from "@/redux/slices/authSlice";
import QRCodeWidget from "./QRCodeWidget";


// -------------------- Types --------------------


interface BudgetStats {
  total: number;
  active: number;
  totalSpent: number;
  totalAllocated: number;
}

interface TontineStats {
  active: number;
  total: number;
  totalReceived: number;
  totalContributed: number;
}

interface RecentExpense {
  id: number;
  title: string;
  category: string;
  date: string;
  amount: number;
}

interface UpcomingPayout {
  id: number;
  tontine_name: string;
  payout_date: string;
  amount: number;
}

interface DashboardStats {
  budgets: BudgetStats;
  tontines: TontineStats;
  recentExpenses?: RecentExpense[];
  upcomingPayouts?: UpcomingPayout[];
  transactions?: any[];
}

// ----------------------------------------------

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddMoney, setShowAddMoney] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const { t } = useTranslations();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser();
      const dashboardData = await getDashboardData();

      setUser(currentUser);
      setStats(dashboardData.stats || dashboardData);
      setTransactions(dashboardData.transactions || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const handleMoneyAdded = async () => {
    loadDashboardData();
  };
  console.log(user);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 bg-background min-h-screen">
        <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
          <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
          <div className="h-48 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
              ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const budgetUsagePercentage =
    (stats?.budgets?.totalAllocated ?? 0) > 0
      ? (stats!.budgets.totalSpent / stats!.budgets.totalAllocated) * 100
      : 0;

  const netTontineFlow =
    (stats?.tontines?.totalReceived || 0) - (stats?.tontines?.totalContributed || 0);

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-md text-slate-500">
              Hi {t("dashboard.greeting", user?.fullName?.split(" ")[0] || "User")},
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              {t("dashboard.manage_money", "Let's Manage Your Money")}
            </h1>
          </div>

          <Link to="/profile">
            <div className="w-14 h-14 rounded-full border-2 border-white shadow-md overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                {user?.profileImage ? (
                <img
                    src={`${import.meta.env.VITE_APP_API_URL}${user.profileImage}`}
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.style.display = "none";
                    }}
                />
                ) : (
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    {user?.fullName?.charAt(0).toUpperCase()}
                </span>
                )}
            </div>
          </Link>
        </div>

        {/* -------------------- Stats Section -------------------- */}

        {stats && (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">

              {/* Total Budgets */}
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

              {/* Budget Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {budgetUsagePercentage.toFixed(1)}%
                  </div>
                  <Progress value={budgetUsagePercentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    ${stats.budgets.totalSpent.toLocaleString()} of $
                    {stats.budgets.totalAllocated.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              {/* Active Tontines */}
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

              {/* Net Flow */}
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
                  <div
                    className={`text-2xl font-bold ${
                      netTontineFlow >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {netTontineFlow >= 0 ? "+" : "-"}$
                    {Math.abs(netTontineFlow).toLocaleString()}
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
                  <Can anyOf={["create:expense"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-6">
                      <Link to="/expenses/create" className="flex flex-col items-center gap-2">
                        <DollarSign className="h-8 w-8" />
                        <span className="font-medium">Add Expense</span>
                        <span className="text-xs text-muted-foreground">Record new spending</span>
                      </Link>
                    </Button>
                  </Can>
                  <Can anyOf={["create:budget"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-6">
                      <Link to="/budgets/create" className="flex flex-col items-center gap-2">
                        <Target className="h-8 w-8" />
                        <span className="font-medium">Create Budget</span>
                        <span className="text-xs text-muted-foreground">Set spending limits</span>
                      </Link>
                    </Button>
                  </Can>
                  <Can anyOf={["create:tontine"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-6">
                      <Link to="/tontines/create" className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8" />
                        <span className="font-medium">Start Tontine</span>
                        <span className="text-xs text-muted-foreground">Create savings group</span>
                      </Link>
                    </Button>
                  </Can>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto p-6"
                    onClick={() => setShowQRCode(true)}
                    >
                    <div className="flex flex-col items-center gap-2">
                        <QrCode className="h-8 w-8" />
                        <span className="font-medium">Scan QR</span>
                        <span className="text-xs text-muted-foreground">
                        Send money via QR code
                        </span>
                    </div>
                    </Button>
                  {/* <Can anyOf={["read:qr-payment"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-6">
                    <Link to="/qr/pending" className="flex flex-col items-center gap-2">
                        <Wallet className="h-8 w-8" />
                        <span className="font-medium">Pending QR Payments</span>
                        <span className="text-xs text-muted-foreground">
                        Complete wallet transfers
                        </span>
                    </Link>
                    </Button>
                </Can> */}
                  {/* <Button variant="outline" size="lg" asChild className="h-auto p-6">
                    <Link to="/analytics" className="flex flex-col items-center gap-2">
                      <PieChart className="h-8 w-8" />
                      <span className="font-medium">View Reports</span>
                      <span className="text-xs text-muted-foreground">Analyze spending</span>
                    </Link>
                  </Button> */}
                </div>
              </CardContent>
            </Card>

            {/* Recent + Upcoming */}
            <div className="grid gap-6 lg:grid-cols-2">

              {/* Recent Expenses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Expenses</CardTitle>
                        <CardDescription>Your latest spending activity</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/expenses" className="flex items-center gap-1">
                        View all <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </Button>
                    </CardHeader>

                    <CardContent>
                    <div className="space-y-4">
                        {!stats.recentExpenses?.length ? (
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
                            <p className="font-bold">${expense.amount.toLocaleString()}</p>
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
                        <Link to="/tontines" className="flex items-center gap-1">
                        View all <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </Button>
                    </CardHeader>

                    <CardContent>
                    <div className="space-y-4">
                        {!stats.upcomingPayouts?.length ? (
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
                            <p className="font-bold text-green-600">
                                ${payout.amount.toLocaleString()}
                            </p>
                            </div>
                        ))
                        )}
                    </div>
                    </CardContent>
                </Card>
                </div>
            </>
            )}
        </div>

        {/* Dialogs */}
        <div className="grid gap-6 px-8">
            <div className="grid grid-cols-2 gap-6">
                <BalanceCard user={user} onAddMoney={() => setShowAddMoney(true)} />
                <QRCodeWidget userId={user?.id?.toString() || ""} />
            </div>


            <QuickActionsGrid onShowQR={() => setShowQRCode(true)} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionChart transactions={transactions} />
                <div className="grid grid-cols-1 gap-6">
                    <RecentTransactions transactions={transactions} />
                    <Card className="rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Linked Payment Methods</h3>
                        <Link to={"/wallet"}>
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                        </div>
                        <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                            <CreditCard className="w-5 h-5 text-slate-600" />
                            <div>
                            <p className="font-medium text-sm dark:text-slate-900">Visa **** 1234</p>
                            <p className="text-xs text-slate-500 dark:text-slate-700">Primary Card</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link to={"/wallet"}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Payment Method
                            </Link>
                        </Button>
                        </div>
                    </Card>
                </div>
            </div>
            <ScanQrSendMoneyDialog
                open={showQRCode}
                onClose={() => setShowQRCode(false)}
            />

        </div>
    </div>
  );
};

export default Dashboard;
