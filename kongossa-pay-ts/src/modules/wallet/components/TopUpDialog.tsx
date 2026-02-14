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
import { createTopUpIntent } from "../api";
import { useStripe } from "@stripe/react-stripe-js";
import { dispatchShowToast, syncCurrentUser } from "@/lib/dispatch";

export function TopUpDialog({
  open,
  onClose,
  paymentMethodId,
  onSuccess,
}: any) {
  const stripe = useStripe();

  // 🔑 amount must be string for proper UX
  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const parsedAmount = Number(amount);
  const isValidAmount =
    amount !== "" && !isNaN(parsedAmount) && parsedAmount > 0;

  const handleTopUp = async () => {
    if (!stripe || !isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount greater than 0",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Create intent
      const { clientSecret } = await createTopUpIntent({
        amount: parsedAmount,
        paymentMethodId,
        remarks,
      });

      // 2️⃣ Confirm payment
      const { error, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret);

      if (error) {
        dispatchShowToast({
          message: error.message || "Top up failed",
          type: "danger",
        });
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        dispatchShowToast({
          message: "Top up successful! Updating wallet…",
          type: "success",
        });

        // 🔄 wait for webhook
        await syncCurrentUser();

        onSuccess();
        onClose();
        setAmount("");
        setRemarks("");
      }
    } catch (err: any) {
      console.error("Top up failed:", err);
      dispatchShowToast({
        message: "Top up failed",
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
          <DialogTitle>Top Up Wallet</DialogTitle>
        </DialogHeader>

        {/* Amount */}
        <Input
          type="text"
          inputMode="decimal"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => {
            // allow empty or numeric
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
              setAmount(value);
            }
          }}
        />

        {/* Remarks */}
        <Textarea
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={3}
        />

        <Button
          onClick={handleTopUp}
          disabled={loading || !stripe || !isValidAmount}
        >
          {loading ? "Processing…" : "Top Up"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
