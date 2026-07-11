// src/modules/wallet/components/PaymentMethodCard.tsx
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
  Phone,
  Globe,
} from "lucide-react";
import { deletePaymentMethod } from "../api";
import { ConfirmationDialog } from "@/components/custom/ConfirmationDialog";
import { TopUpDialog } from "./TopUpDialog";

const methodIcons: Record<string, any> = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_account: Landmark,
  mobile_money: Smartphone,
  paypal: CreditCard,
  payment_gateway: CreditCard,
};

const glowGradients = [
  "from-indigo-500/20 via-purple-500/10 to-transparent",
  "from-emerald-500/20 via-teal-500/10 to-transparent",
  "from-rose-500/20 via-pink-500/10 to-transparent",
  "from-amber-500/20 via-orange-500/10 to-transparent",
  "from-sky-500/20 via-cyan-500/10 to-transparent",
];

export default function PaymentMethodCard({
  method,
  onRefresh,
}: {
  method: any;
  onRefresh: () => void;
}) {
  const IconComponent =
    methodIcons[method.type as keyof typeof methodIcons] || CreditCard;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const glow = useMemo(
    () => glowGradients[Math.floor(Math.random() * glowGradients.length)],
    []
  );

  const isMoMo =
    method.provider === "mtn_momo" ||
    method.provider === "orange_money" ||
    method.provider === "transfi_zamtel" ||
    method.type === "mobile_money";
  const isOrangeMoney = method.provider === "orange_money";
  const isTransfi = method.provider === "transfi_zamtel";
  const isMpesa = method.provider === "mpesa";
  const isAirtel = method.provider === "airtel_money";
  const isPaystack = method.provider === "paystack";
  const isFlutterwave = method.provider === "flutterwave";

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePaymentMethod(method.id);
      onRefresh();
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <div
          className={`absolute -inset-[2px] rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition ${glow}`}
        />

        <Card className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl shadow-md group-hover:shadow-xl transition-all">
          <CardContent className="p-4 md:p-6 space-y-3 md:space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-linear-to-br from-slate-800 to-slate-600 dark:from-slate-700 dark:to-slate-900 flex items-center justify-center shadow-inner">
                  <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight text-sm md:text-base">
                    {method.type
                      .replace("_", " ")
                      .replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                    {isOrangeMoney
                      ? "Orange Money"
                      : isTransfi
                      ? "Zamtel"
                      : isMpesa
                      ? "M-Pesa"
                      : isAirtel
                      ? "Airtel Money"
                      : isPaystack
                      ? "Paystack"
                      : isFlutterwave
                      ? "Flutterwave"
                      : isMoMo
                      ? "MTN MoMo"
                      : method.bankName || method.provider || "Unknown Provider"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 md:gap-2">
                {method.is_default && (
                  <Badge className="bg-yellow-100 text-yellow-900 dark:bg-yellow-500/20 dark:text-yellow-300 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Default
                  </Badge>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition h-8 w-8"
                  onClick={() => setIsConfirmOpen(true)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                {method.accountName}
              </p>

              {isMoMo ? (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {method.phoneNumber}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                    <Globe className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {method.countryCode} — {method.currency}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <p className="font-mono text-xs md:text-sm tracking-widest text-slate-700 dark:text-slate-300">
                    **** {method.lastFour || "0000"}
                  </p>
                  {method.expiryDate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Exp {method.expiryDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
              <Badge
                className={
                  method.isVerified
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 text-xs"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 text-xs"
                }
              >
                {method.isVerified ? "Verified" : "Pending"}
              </Badge>

              <Button
                size="sm"
                className="gap-1 bg-linear-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white text-xs md:text-sm px-3 md:px-4"
                onClick={() => setIsTopUpOpen(true)}
              >
                <Wallet className="w-3 h-3 md:w-4 md:h-4" />
                Top Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Delete payment method?"
        description={`Delete "${method.accountName || "this account"}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText={isDeleting ? "Deleting..." : "Yes, Delete"}
        loading={isDeleting}
        variant="destructive"
      />

      <TopUpDialog
        open={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        paymentMethod={method}
        onSuccess={onRefresh}
      />
    </>
  );
}