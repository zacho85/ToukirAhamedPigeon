import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { payQRPayment } from "@/modules/dashboard/api/qrPayments";
import { syncCurrentUser, dispatchShowToast } from "@/lib/dispatch";

export default function CompleteQRPaymentDialog({
  open,
  onClose,
  qr,
  onSuccess,
}: any) {
  const [amount, setAmount] = useState(qr.amount || "");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await payQRPayment(qr.id, {
        amount: qr.amount ? undefined : Number(amount),
      });

      await syncCurrentUser();

      dispatchShowToast({
        type: "success",
        message: "QR payment completed successfully!",
      });

      onClose();
      onSuccess();
    } catch {
      dispatchShowToast({
        type: "danger",
        message: "Payment failed or insufficient balance",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm QR Payment</DialogTitle>
        </DialogHeader>

        <p className="text-sm">
          Pay <b>{qr.recipient.fullName}</b>
        </p>

        {!qr.amount && (
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        )}

        <Button
          className="w-full"
          onClick={handlePay}
          disabled={loading}
        >
          {loading ? "Processing…" : "Confirm Payment"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
