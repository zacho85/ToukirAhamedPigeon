import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { requestPayout } from "../api";
import { dispatchShowToast, syncCurrentUser } from "@/lib/dispatch";

export function PayoutDialog({
  open,
  onClose,
  onSuccess,
  maxAmount,
  hasPendingPayout // optional: wallet balance
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

  const FEE = 1; // flat fee in USD

  const parsedAmount = Number(amount);

  // Compute net amount the user will actually receive
  const netAmount = !isNaN(parsedAmount) ? Math.max(parsedAmount - FEE, 0) : 0;

  // Valid if positive amount, under wallet limit, and net > 0
  const isValidAmount =
    amount !== "" &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    (maxAmount ? parsedAmount <= maxAmount : true) &&
    netAmount > 0;

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
      // Send original amount to backend; backend handles fee
      await requestPayout(parsedAmount);

      dispatchShowToast({
        message: `Withdrawal request submitted. You will receive $${netAmount.toFixed(
          2
        )} after fees.`,
        type: "success",
      });

      // Update wallet
      await syncCurrentUser();

      onSuccess?.();
      onClose();
      setAmount("");
      setRemarks("");
    } catch (err: any) {
      console.error("Payout failed:", err);
      dispatchShowToast({
        message:
          err?.response?.data?.message ||
          "Withdrawal request failed",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        {/* Amount input */}
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

        {/* Wallet balance */}
        {maxAmount !== undefined && (
          <p className="text-xs text-slate-500">
            Available: ${maxAmount.toFixed(2)}
          </p>
        )}

        {/* Show net amount dynamically */}
        {parsedAmount > 0 && (
          <p className="text-xs text-slate-700">
            You will receive:{" "}
            <span className="font-semibold">${netAmount.toFixed(2)}</span> after ${FEE} fee
          </p>
        )}

        {/* Remarks */}
        <Textarea
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
        />

        {/* Pending payout warning */}
        {hasPendingPayout && (
          <p className="text-xs text-red-500">
            You already have a withdrawal in progress.
          </p>
        )}

        {/* Withdraw button */}
        <Button
          onClick={handlePayout}
          disabled={loading || !isValidAmount || hasPendingPayout}
          variant="destructive"
        >
          {loading ? "Processing…" : "Withdraw"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
