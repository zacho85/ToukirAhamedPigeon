import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Trash2,
  Star,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react";
import { deletePaymentMethod } from "../api";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import { TopUpDialog } from "./TopUpDialog";

/* -------------------- ICON MAP -------------------- */
const methodIcons = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_account: Landmark,
  mobile_money: Smartphone,
  paypal: CreditCard,
};

/* -------------------- GRADIENT GLOWS -------------------- */
const glowGradients = [
  "from-indigo-500/20 via-purple-500/10 to-transparent",
  "from-emerald-500/20 via-teal-500/10 to-transparent",
  "from-rose-500/20 via-pink-500/10 to-transparent",
  "from-amber-500/20 via-orange-500/10 to-transparent",
  "from-sky-500/20 via-cyan-500/10 to-transparent",
];

/* -------------------- CARD -------------------- */
export default function PaymentMethodCard({
  method,
  onRefresh,
}: {
  method: PaymentMethodData;
  onRefresh: () => void;
}) {
  const IconComponent =
    methodIcons[(method as any).type as keyof typeof methodIcons] ||
    CreditCard;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  /* Random gradient stays stable per card */
  const glow = useMemo(
    () => glowGradients[Math.floor(Math.random() * glowGradients.length)],
    []
  );

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePaymentMethod((method as any).id);
      onRefresh();
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="relative group">
        {/* Gradient glow */}
        <div
          className={`absolute -inset-[2px] rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition ${glow}`}
        />

        <Card className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-md group-hover:shadow-xl transition-all">
          <CardContent className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-slate-800 to-slate-600 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center shadow-inner">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {((method as any).type as string)
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {(method as any).bankName ||
                      (method as any).provider ||
                      "Unknown Provider"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(method as any).is_default && (
                  <Badge className="bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {(method as any).accountName}
              </p>

              <div className="flex items-center justify-between pt-2">
                <p className="font-mono text-sm tracking-widest text-slate-700 dark:text-slate-300">
                  **** {(method as any).lastFour || "0000"}
                </p>

                {(method as any).expiryDate && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Exp {((method as any).expiryDate as string)}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <Badge
                className={
                  (method as any).isVerified
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }
              >
                {(method as any).isVerified ? "Verified" : "Pending"}
              </Badge>

              <Button
                size="sm"
                className="gap-1 bg-linear-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white"
                onClick={() => setIsTopUpOpen(true)}
              >
                <Wallet className="w-4 h-4" />
                Top Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete payment method?"
        description={`Delete "${(method as any).accountName || "this account"}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
        loading={isDeleting}
        variant="destructive"
      />

      {/* Top up */}
      <TopUpDialog
        open={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        paymentMethodId={(method as any).stripePmId}
        onSuccess={onRefresh}
      />
    </>
  );
}
