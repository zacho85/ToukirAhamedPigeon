import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { requestPayout } from "../api";
import { dispatchShowToast, syncUserProfile } from "@/lib/dispatch";
import { getFeeQuote } from "@/modules/fee-management/api";
import type { FeeQuote } from "@/modules/fee-management/api";

export function PayoutDialog({
  open,
  onClose,
  onSuccess,
  maxAmount,
  hasPendingPayout
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  maxAmount?: number;
  hasPendingPayout?: boolean;
}) {
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const parsedAmount = Number(amount);
  const amountNum = !isNaN(parsedAmount) && parsedAmount > 0 ? parsedAmount : 0;

  // The withdrawal fee comes from the server (Fee Management) and is paid on top.
  const [quote, setQuote] = useState<FeeQuote | null>(null);
  useEffect(() => {
    if (!(amountNum > 0)) {
      setQuote(null);
      return;
    }
    const t = setTimeout(() => {
      getFeeQuote("withdrawal", amountNum)
        .then(setQuote)
        .catch(() => setQuote(null));
    }, 300);
    return () => clearTimeout(t);
  }, [amountNum]);

  // Only trust a quote for the amount currently typed.
  const quoteReady = quote !== null && quote.amount === Math.round(amountNum * 100) / 100;
  const fee = quoteReady ? quote.fee : 0;
  const total = amountNum + fee;

  const isValidAmount =
    amountNum > 0 &&
    quoteReady &&
    (maxAmount !== undefined ? total <= maxAmount : true);

  const handlePayout = async () => {
    if (!isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid withdrawal amount",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      await requestPayout(amountNum);

      dispatchShowToast({
        message: `Withdrawal request submitted. You will receive $${amountNum.toFixed(2)}; $${total.toFixed(2)} was taken from your wallet.`,
        type: "success",
      });

      await syncUserProfile();
      onSuccess?.();
      onClose();
      setAmount("");
      setRemarks("");
    } catch (err: any) {
      console.error("Payout failed:", err);
      dispatchShowToast({
        message: err?.response?.data?.message || "Withdrawal request failed",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <Input
          type="text"
          inputMode="decimal"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
              setAmount(value);
            }
          }}
        />

        {maxAmount !== undefined && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Available: ${maxAmount.toFixed(2)}
          </p>
        )}

        {amountNum > 0 && (
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>You will receive</span>
              <span>${amountNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee{quoteReady ? ` (${quote.percent}%)` : ""}</span>
              <span>{quoteReady ? `$${fee.toFixed(2)}` : "..."}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total from your wallet</span>
              <span>{quoteReady ? `$${total.toFixed(2)}` : "..."}</span>
            </div>
            {quoteReady && maxAmount !== undefined && total > maxAmount && (
              <p className="text-red-500 dark:text-red-400">Not enough balance to cover the amount and the fee.</p>
            )}
          </div>
        )}

        <Textarea
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
        />

        {hasPendingPayout && (
          <p className="text-xs text-red-500 dark:text-red-400">
            You already have a withdrawal in progress.
          </p>
        )}

        <Button
          onClick={handlePayout}
          disabled={loading || !isValidAmount || hasPendingPayout}
          variant="destructive"
          className="w-full"
        >
          {loading ? "Processing…" : "Withdraw"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}