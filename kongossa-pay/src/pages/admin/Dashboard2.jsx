
// import React, { useState, useEffect } from "react";
// // import { User, Transaction } from "@/api/entities";
// import { getTransactions } from "@/api/transactions";
// import { Link } from "react-router-dom";
// import { createPageUrl } from "@/utils";
// import { Button } from "@/components/ui/button";
// import { 
//   Card, 
//   CardHeader, 
//   CardTitle, 
//   CardContent 
// } from "@/components/ui/card"; // Added CardHeader, CardTitle, CardContent
// import { 
//   Send, 
//   ArrowDownLeft, 
//   Plus, 
//   Minus, 
//   QrCode,
//   Receipt,
//   History,
//   CreditCard
// } from "lucide-react";

// import BalanceCard from "@/components/dashboard/BalanceCard";
// import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
// import TransactionChart from "@/components/dashboard/TransactionChart";
// import RecentTransactions from "@/components/dashboard/RecentTransactions";
// import AddMoneyDialog from "@/components/dashboard/AddMoneyDialog";
// import QRCodeDialog from "@/components/dashboard/QRCodeDialog";
// import { useTranslation } from '@/components/common/LanguageProvider';
// import { getCurrentUser } from "@/api/auth";
// import { getDashboardData } from "@/api/dashboard";

// export default function Dashboard() {
//   const [user, setUser] = useState(null);
//   const [transactions, setTransactions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showAddMoney, setShowAddMoney] = useState(false);
//   const [showQRCode, setShowQRCode] = useState(false);
//   const { t } = useTranslation();

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       const user = await getCurrentUser();
//       const dashboardData = await getDashboardData();
//       console.log("Logged-in user:", user);
//       console.log("Dashboard Data:", dashboardData);
//     } catch (error) {
//       console.error("Error loading dashboard data:", error);
//     }
//     setIsLoading(false);
//   };
  
//   const handleMoneyAdded = async () => {
//     loadDashboardData();
//   };

//   if (isLoading) {
//     return (
//       <div className="p-4 md:p-8 space-y-6 bg-background min-h-screen">
//         <div className="animate-pulse space-y-6 max-w-7xl mx-auto">
//           <div className="h-8 bg-slate-200 rounded w-64 mb-4"></div>
//           <div className="h-48 bg-slate-200 rounded-2xl"></div>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             {Array(4).fill(0).map((_, i) => (
//               <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
//             ))}
//           </div>
//           <div className="h-64 bg-slate-200 rounded-2xl"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-background min-h-screen">
//       <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <div>
//             <p className="text-md text-slate-500">{t('dashboard.greeting', { name: user?.full_name?.split(' ')[0] || 'User' })}</p>
//             <h1 className="text-3xl font-bold text-foreground">{t('dashboard.manage_money')}</h1>
//           </div>
//           <Link to={createPageUrl("Profile")}>
//             <img 
//               src={user?.profile_image || `https://avatar.vercel.sh/${user?.email}.png`} 
//               alt="User" 
//               className="w-14 h-14 rounded-full border-2 border-white shadow-md"
//             />
//           </Link>
//         </div>

//         {/* Balance Card */}
//         <BalanceCard 
//           user={user}
//           onAddMoney={() => setShowAddMoney(true)}
//         />

//         {/* Quick Actions */}
//         <QuickActionsGrid onShowQR={() => setShowQRCode(true)} />

//         <div className="grid lg:grid-cols-5 gap-8">
//           {/* Transaction Chart */}
//           <div className="lg:col-span-3">
//             <TransactionChart transactions={transactions} />
//           </div>

//           {/* Recent Transactions & Wallet */}
//           <div className="lg:col-span-2 space-y-8">
//             <RecentTransactions transactions={transactions} />
//             <Card className="rounded-2xl shadow-sm bg-card">
//               <CardHeader>
//                 <CardTitle className="text-lg">Méthodes de Paiement</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
//                     <CreditCard className="w-5 h-5 text-slate-600" />
//                     <div>
//                       <p className="font-medium text-sm">Visa **** 1234</p>
//                       <p className="text-xs text-slate-500">Carte Principale</p>
//                     </div>
//                   </div>
//                   <Button variant="outline" size="sm" className="w-full" asChild>
//                     <Link to={createPageUrl("Wallet")}>
//                       <Plus className="w-4 h-4 mr-2" />
//                       Gérer les méthodes
//                     </Link>
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       <AddMoneyDialog 
//         isOpen={showAddMoney} 
//         onClose={() => setShowAddMoney(false)} 
//         onMoneyAdded={handleMoneyAdded}
//         user={user}
//       />

//       <QRCodeDialog
//         isOpen={showQRCode}
//         onClose={() => setShowQRCode(false)}
//         user={user}
//       />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Wallet,
  CreditCard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import BalanceCard from "@/components/dashboard/BalanceCard";
import QuickActionsGrid from "@/components/dashboard/QuickActionsGrid";
import TransactionChart from "@/components/dashboard/TransactionChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import AddMoneyDialog from "@/components/dashboard/AddMoneyDialog";
import QRCodeDialog from "@/components/dashboard/QRCodeDialog";
import { useTranslation } from "@/components/common/LanguageProvider";
import { getCurrentUser } from "@/api/auth";
import { getDashboardData } from "@/api/dashboard";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { t } = useTranslation();

  // console.log(user);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser();
      const dashboardData = await getDashboardData(); // should return the same `stats` object
      setUser(currentUser);
      setStats(dashboardData.stats || dashboardData); // support either format
      setTransactions(dashboardData.transactions || []);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const handleMoneyAdded = async () => {
    loadDashboardData();
  };

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
    stats?.budgets?.totalAllocated > 0
      ? (stats.budgets.totalSpent / stats.budgets.totalAllocated) * 100
      : 0;

  const netTontineFlow =
    (stats?.tontines?.totalReceived || 0) - (stats?.tontines?.totalContributed || 0);

  return (
    <div className="bg-background min-h-screen">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-md text-slate-500">
              {t("dashboard.greeting", { name: user?.fullName?.split(" ")[0] || "User" })}
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              {t("dashboard.manage_money")}
            </h1>
          </div>
          <Link to={createPageUrl("Profile")}>
            <img
              src={user?.profile_image || `https://avatar.vercel.sh/${user?.email}.png`}
              alt="User"
              className="w-14 h-14 rounded-full border-2 border-white shadow-md"
            />
          </Link>
        </div>

        {/* -------------------- LARAVEL DASHBOARD STATS SECTION -------------------- */}
        {stats && (
          <>
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
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
                  <Button variant="outline" size="lg" asChild className="h-auto p-6">
                    <Link to="/expenses/create" className="flex flex-col items-center gap-2">
                      <DollarSign className="h-8 w-8" />
                      <span className="font-medium">Add Expense</span>
                      <span className="text-xs text-muted-foreground">Record new spending</span>
                    </Link>
                  </Button>

                  <Button variant="outline" size="lg" asChild className="h-auto p-6">
                    <Link to="/budgets/create" className="flex flex-col items-center gap-2">
                      <Target className="h-8 w-8" />
                      <span className="font-medium">Create Budget</span>
                      <span className="text-xs text-muted-foreground">Set spending limits</span>
                    </Link>
                  </Button>

                  <Button variant="outline" size="lg" asChild className="h-auto p-6">
                    <Link to="/tontines/create" className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8" />
                      <span className="font-medium">Start Tontine</span>
                      <span className="text-xs text-muted-foreground">Create savings group</span>
                    </Link>
                  </Button>

                  <Button variant="outline" size="lg" asChild className="h-auto p-6">
                    <Link to="/analytics" className="flex flex-col items-center gap-2">
                      <PieChart className="h-8 w-8" />
                      <span className="font-medium">View Reports</span>
                      <span className="text-xs text-muted-foreground">Analyze spending</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Recent Expenses & Upcoming Payouts */}
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
                      View all
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!stats?.recentExpenses?.length ? (
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
                    <Link to="/tontines" className="flex items-center gap-1">
                      View all
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {!stats?.upcomingPayouts?.length ? (
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
                            <p className="font-bold text-green-600">
                              ${payout.amount.toLocaleString()}
                            </p>
                          </div>
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
      <AddMoneyDialog
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onMoneyAdded={handleMoneyAdded}
        user={user}
      />
      <QRCodeDialog isOpen={showQRCode} onClose={() => setShowQRCode(false)} user={user} />
    </div>
  );
}

