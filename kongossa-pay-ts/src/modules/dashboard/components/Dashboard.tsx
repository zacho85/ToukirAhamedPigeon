import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  CreditCard,
  DollarSign,
  Plus,
  QrCode,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Link as LinkIcon
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

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 bg-background min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="grid grid-cols-2 gap-3">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
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
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">
              Hello {t("dashboard.greeting", user?.fullName?.split(" ")[0] || "User")},
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t("dashboard.manage_money", "Let's Manage Your Money")}
            </h1>
          </div>

          <Link to="/profile">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-border shadow-md overflow-hidden flex items-center justify-center bg-muted">
              {user?.profileImage ? (
                <img
                  src={`${import.meta.env.VITE_APP_API_URL}${user.profileImage}`}
                  alt="User"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-base sm:text-lg font-semibold text-foreground">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </Link>
        </div>

        {stats && (
          <>
            {/* Stats Overview - Mobile: 2 columns, Tablet/Desktop: 4 columns */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

              {/* Total Budgets */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Total Budgets
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.budgets.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.budgets.active} active budgets
                  </p>
                </CardContent>
              </Card>

              {/* Budget Usage */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Budget Usage
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">
                    {budgetUsagePercentage.toFixed(1)}%
                  </div>
                  <Progress value={budgetUsagePercentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    ${stats.budgets.totalSpent.toLocaleString()} of $
                    {stats.budgets.totalAllocated.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              {/* Active Tontines */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Active Tontines
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.tontines.active}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.tontines.total} total tontines
                  </p>
                </CardContent>
              </Card>

              {/* Net Flow */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Tontine Net Flow
                  </CardTitle>
                  {netTontineFlow >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-xl sm:text-2xl font-bold ${
                      netTontineFlow >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {netTontineFlow >= 0 ? "+" : "-"}$
                    {Math.abs(netTontineFlow).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    ${stats.tontines.totalReceived.toLocaleString()} received,
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions - Mobile: 2 columns, Tablet: 3, Desktop: 4 */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                  Frequently used actions to manage your finances
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Can anyOf={["create:expense"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-4 sm:p-6">
                      <Link to="/expenses/create" className="flex flex-col items-center gap-2">
                        <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
                        <span className="font-medium text-xs sm:text-sm">Add Expense</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">Record new spending</span>
                      </Link>
                    </Button>
                  </Can>
                  
                  <Can anyOf={["create:budget"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-4 sm:p-6">
                      <Link to="/budgets/create" className="flex flex-col items-center gap-2">
                        <Target className="h-6 w-6 sm:h-8 sm:w-8" />
                        <span className="font-medium text-xs sm:text-sm">Create Budget</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">Set spending limits</span>
                      </Link>
                    </Button>
                  </Can>
                  
                  <Can anyOf={["create:payment-link"]}>
                    <Button variant="outline" size="lg" asChild className="h-auto p-4 sm:p-6">
                      <Link to="/payment-links/create" className="flex flex-col items-center gap-2">
                        <LinkIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                        <span className="font-medium text-xs sm:text-sm">Payment Link</span>
                        <span className="text-xs text-muted-foreground hidden sm:inline">Create payment link</span>
                      </Link>
                    </Button>
                  </Can>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto p-4 sm:p-6"
                    onClick={() => setShowQRCode(true)}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <QrCode className="h-6 w-6 sm:h-8 sm:w-8" />
                      <span className="font-medium text-xs sm:text-sm">Scan QR</span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">Send money via QR</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent + Upcoming - Mobile: 1 column, Tablet/Desktop: 2 columns */}
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-base sm:text-lg text-foreground">Recent Expenses</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Your latest spending activity
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/expenses" className="flex items-center gap-1 text-sm">
                      View all <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3">
                    {!stats.recentExpenses?.length ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent expenses found
                      </p>
                    ) : (
                      stats.recentExpenses.map((expense) => (
                        <div key={expense.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground text-sm sm:text-base">{expense.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {expense.category} • {expense.date}
                            </p>
                          </div>
                          <p className="font-bold text-foreground text-sm sm:text-base">
                            ${expense.amount.toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
                  <div>
                    <CardTitle className="text-base sm:text-lg text-foreground">Upcoming Payouts</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                      Your next tontine payouts
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/tontines" className="flex items-center gap-1 text-sm">
                      View all <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="space-y-3">
                    {!stats.upcomingPayouts?.length ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No upcoming payouts
                      </p>
                    ) : (
                      stats.upcomingPayouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground text-sm sm:text-base">{payout.tontine_name}</p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {payout.payout_date}
                            </p>
                          </div>
                          <p className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">
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

        {/* Dialogs - Mobile: 1 column, Tablet/Desktop: 2 columns */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BalanceCard user={user} onAddMoney={() => setShowAddMoney(true)} />
            <QRCodeWidget userId={user?.id?.toString() || ""} />
          </div>

          <QuickActionsGrid onShowQR={() => setShowQRCode(true)} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <TransactionChart transactions={transactions} />
            <div className="space-y-4">
              <RecentTransactions transactions={transactions} />
              <Card className="rounded-2xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">
                    Linked Payment Methods
                  </h3>
                  <Link to="/wallet">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm text-foreground dark:text-foreground">Visa **** 1234</p>
                      <p className="text-xs text-muted-foreground">Primary Card</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/wallet">
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
    </div>
  );
};

export default Dashboard;