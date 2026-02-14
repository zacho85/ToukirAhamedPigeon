
import React, { useState, useEffect } from "react";
// import { User, Transaction } from "@/api/entities";
import { getTransactions } from "@/api/transactions";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card"; // Added CardHeader, CardTitle, CardContent
import { 
  Send, 
  ArrowDownLeft, 
  Plus, 
  Minus, 
  QrCode,
  Receipt,
  History,
  CreditCard
} from "lucide-react";

import BalanceCard from "../components/dashboard/BalanceCard";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";
import TransactionChart from "../components/dashboard/TransactionChart";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import AddMoneyDialog from "../components/dashboard/AddMoneyDialog";
import QRCodeDialog from "../components/dashboard/QRCodeDialog";
import { useTranslation } from '@/components/common/LanguageProvider';
import { getCurrentUser } from "@/api/auth";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await getCurrentUser();
      console.log("Logged-in user:", user);
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
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-md text-slate-500">{t('dashboard.greeting', { name: user?.full_name?.split(' ')[0] || 'User' })}</p>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard.manage_money')}</h1>
          </div>
          <Link to={createPageUrl("Profile")}>
            <img 
              src={user?.profile_image || `https://avatar.vercel.sh/${user?.email}.png`} 
              alt="User" 
              className="w-14 h-14 rounded-full border-2 border-white shadow-md"
            />
          </Link>
        </div>

        {/* Balance Card */}
        <BalanceCard 
          user={user}
          onAddMoney={() => setShowAddMoney(true)}
        />

        {/* Quick Actions */}
        <QuickActionsGrid onShowQR={() => setShowQRCode(true)} />

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Transaction Chart */}
          <div className="lg:col-span-3">
            <TransactionChart transactions={transactions} />
          </div>

          {/* Recent Transactions & Wallet */}
          <div className="lg:col-span-2 space-y-8">
            <RecentTransactions transactions={transactions} />
            <Card className="rounded-2xl shadow-sm bg-card">
              <CardHeader>
                <CardTitle className="text-lg">Méthodes de Paiement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-sm">Visa **** 1234</p>
                      <p className="text-xs text-slate-500">Carte Principale</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={createPageUrl("Wallet")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Gérer les méthodes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddMoneyDialog 
        isOpen={showAddMoney} 
        onClose={() => setShowAddMoney(false)} 
        onMoneyAdded={handleMoneyAdded}
        user={user}
      />

      <QRCodeDialog
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
        user={user}
      />
    </div>
  );
}
