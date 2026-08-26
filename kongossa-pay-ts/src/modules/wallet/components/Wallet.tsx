// src/modules/wallet/components/Wallet.tsx
import { useState, useEffect } from "react";
import {
    ArrowUpFromLine,
    ArrowDownToLine,
  Plus,
  Shield
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import PaymentMethodCard from "./PaymentMethodCard";
import AddPaymentMethodForm from "./AddPaymentMethodForm";
import WalletBalance from "./WalletBalance";
import PlatformBalanceCard from "./PlatformBalanceCard";
import TransactionFeeCard from "./TransactionFeeCard";

import { useAppSelector } from "@/hooks/useRedux";
import {
  getWalletStats,
  getPlatformStats,
  listPaymentMethods
} from "../api";
import { PayoutDialog } from "./PayoutDialog";
import { TopUpDialog } from "./TopUpDialog";
import { syncWalletBalance  } from "@/lib/dispatch";

/* ---------------- Types ---------------- */

interface WalletStats {
  moneyIn: number;
  moneyOut: number;
  growthPercent: number;
  pendingPayoutAmount: number;
}

interface PlatformStats {
  platformBalance: number;
  totalTopUp: number;
  totalPayout: number;
  totalTransactionFee: number;
  totalFeePayout: number;
  totalFeeBalance: number;
}

export default function Wallet() {
  const currentUser = useAppSelector((state) => (state.auth as any)?.user);

  const [walletStats, setWalletStats] = useState<WalletStats>({
    moneyIn: 0,
    moneyOut: 0,
    growthPercent: 0,
    pendingPayoutAmount: 0,
  });

  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    platformBalance: 0,
    totalTopUp: 0,
    totalPayout: 0,
    totalTransactionFee: 0,
    totalFeePayout: 0,
    totalFeeBalance: 0,
  });

  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPayout, setShowPayout] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  /* ---------------- Loaders ---------------- */

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    await syncWalletBalance();
    await Promise.all([
      loadWalletStats(),
      loadPlatformStats(),
      loadWalletData(),
    ]);
    setIsLoading(false);
  };

  const loadWalletStats = async () => {
    const data = await getWalletStats();
    setWalletStats(data);
  };

  const loadPlatformStats = async () => {
    const data = await getPlatformStats();
    setPlatformStats(data);
  };

  const loadWalletData = async () => {
    try {
      const [stats, platform, methods] = await Promise.all([
        getWalletStats(),
        getPlatformStats(),
        listPaymentMethods(),
      ]);
      setWalletStats(stats);
      setPlatformStats(platform);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    }
  };

  /* ---------------- Loading UI ---------------- */

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-3 md:p-6 space-y-6 md:space-y-8 w-full max-w-7xl mx-auto">

      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">My Wallet</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your balance and payment methods</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={() => setShowTopUp(true)}
            className="w-full sm:w-auto"
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" />
            Add Money
          </Button>

          <Button
            variant="destructive"
            onClick={() => setShowPayout(true)}
            className="w-full sm:w-auto"
          >
            <ArrowUpFromLine className="w-4 h-4 mr-2" />
            Withdraw
          </Button>

          <Button variant="outline" onClick={() => setShowAddMethod(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* User Wallet */}
      <WalletBalance user={currentUser} stats={walletStats} />

      {/* Platform Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <PlatformBalanceCard stats={platformStats} />
        <TransactionFeeCard stats={platformStats} />
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Payment Methods</h2>
          <Badge variant="outline">{paymentMethods.length}</Badge>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onRefresh={loadAll}
            />
          ))}
        </div>
      </div>

      {/* Security - Dark mode text fix */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4 md:p-6 flex gap-3 md:gap-4">
          <Shield className="text-green-600 dark:text-green-400 w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-300 text-xs md:text-sm">
            Your payment info is encrypted and tokenized with bank-level security.
          </p>
        </CardContent>
      </Card>

      {/* Dialog – fixed height with scroll */}
      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent className="sm:max-w-lg min-h-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <AddPaymentMethodForm
            onSuccess={() => {
              loadAll();
              setShowAddMethod(false);
            }}
            onCancel={() => setShowAddMethod(false)}
          />
        </DialogContent>
      </Dialog>

      <PayoutDialog
        open={showPayout}
        onClose={() => setShowPayout(false)}
        maxAmount={currentUser?.walletBalance || 0}
        onSuccess={loadAll}
        hasPendingPayout={walletStats.pendingPayoutAmount > 0}
      />

      <TopUpDialog
        open={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => {
          setShowTopUp(false);
          loadAll();
        }}
      />
    </div>
  );
}