import { useState, useEffect } from "react";
import {
    ArrowUpFromLine,
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
  const currentUser = useAppSelector((state) => state.auth.user);

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


  /* ---------------- Loaders ---------------- */

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
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
    if (!currentUser) return;
    const methods = await listPaymentMethods();
    setPaymentMethods(methods);
  };

  /* ---------------- Loading UI ---------------- */

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="p-2 space-y-8 min-w-full mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <p className="text-slate-500">Manage your balance and payment methods</p>
        </div>

        <div className="flex gap-4">
            <Button
                variant="destructive"
                onClick={() => setShowPayout(true)}
                >
                <ArrowUpFromLine className="w-4 h-4 mr-2" />
                Withdraw
            </Button>

            <Button onClick={() => setShowAddMethod(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Method
            </Button>
        </div>
      </div>

      {/* User Wallet */}
      <WalletBalance user={currentUser} stats={walletStats} />

      {/* Platform Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <PlatformBalanceCard stats={platformStats} />
        <TransactionFeeCard stats={platformStats} />
      </div>

      {/* Payment Methods */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          <Badge variant="outline">{paymentMethods.length}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onRefresh={loadAll}
            />
          ))}
        </div>
      </div>

      {/* Security */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 flex gap-4">
          <Shield className="text-green-600" />
          <p className="text-green-700 text-sm">
            Your payment info is encrypted and tokenized with bank-level security.
          </p>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent>
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
    </div>
  );
}
