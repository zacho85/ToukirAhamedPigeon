import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { createTopUpIntent, createMoMoTopUp, checkMoMoStatus, createOrangeTopUp, createTransfiTopUp } from "../api";
import { useStripe } from "@stripe/react-stripe-js";
import { dispatchShowToast, syncUserProfile } from "@/lib/dispatch";
import { convertCurrency } from "@/lib/exchange-rate";

export function TopUpDialog({
  open,
  onClose,
  paymentMethod,
  onSuccess,
}: any) {
  const stripe = useStripe();

  const [amount, setAmount] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [momoStatus, setMomoStatus] = useState<string>("");
  const [usdEstimate, setUsdEstimate] = useState<number>(0);
  const [momoCurrency, setMomoCurrency] = useState<string>("");

  const isMobileMoney =
    paymentMethod?.provider === "mtn_momo" ||
    paymentMethod?.provider === "orange_money" ||
    paymentMethod?.provider === "transfi_zamtel" ||
    paymentMethod?.type === "mobile_money";

  const isOrangeMoney = paymentMethod?.provider === "orange_money";
  const isTransfi = paymentMethod?.provider === "transfi_zamtel";

  const parsedAmount = Number(amount);
  const isValidAmount =
    amount !== "" && !isNaN(parsedAmount) && parsedAmount > 0;

  useEffect(() => {
    if (isMobileMoney && paymentMethod?.currency) {
      setMomoCurrency(paymentMethod.currency);
    }
  }, [paymentMethod]);

  useEffect(() => {
    if (isValidAmount && momoCurrency) {
      convertCurrency(parsedAmount, momoCurrency, "USD").then((result) => {
        setUsdEstimate(result.converted);
      });
    } else {
      setUsdEstimate(0);
    }
  }, [amount, momoCurrency]);

  const handleStripeTopUp = async () => {
    if (!stripe || !isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount greater than 0",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Creating top-up intent with:", {
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.stripePmId,
        remarks,
      });

      const { clientSecret } = await createTopUpIntent({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.stripePmId,
        remarks,
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

      if (error) {
        console.error("Payment error:", error);
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

        setTimeout(async () => {
          await syncUserProfile();
          onSuccess?.();
          onClose();
          setAmount("");
          setRemarks("");
        }, 3000);
      }
    } catch (err: any) {
      console.error("Top up failed:", err);
      dispatchShowToast({
        message: err.message || "Top up failed",
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoMoTopUp = async () => {
    if (!isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    setMomoStatus("initiating");

    try {
      const { topupId, message } = await createMoMoTopUp({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.id,
      });

      dispatchShowToast({
        message: message || "Payment request sent to your phone",
        type: "success",
      });

      setMomoStatus("pending");

      const pollInterval = setInterval(async () => {
        try {
          const result = await checkMoMoStatus(topupId);
          setMomoStatus(result.status);

          if (result.status === "SUCCESSFUL") {
            clearInterval(pollInterval);
            dispatchShowToast({
              message: `Top up successful! $${result.amountAdded?.toFixed(2)} added to wallet.`,
              type: "success",
            });
            await syncUserProfile();
            onSuccess?.();
            onClose();
            setAmount("");
            setRemarks("");
          } else if (result.status === "FAILED") {
            clearInterval(pollInterval);
            dispatchShowToast({
              message: "MoMo payment failed. Please try again.",
              type: "danger",
            });
          }
        } catch {
          clearInterval(pollInterval);
          dispatchShowToast({
            message: "Failed to check payment status",
            type: "danger",
          });
        }
      }, 3000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (momoStatus === "pending" || momoStatus === "initiating") {
          setMomoStatus("timeout");
        }
      }, 120000);
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : err.response?.data?.error?.message ||
            err.message ||
            "MoMo top up failed";
      console.error("MoMo top up error:", err.response?.data || err);
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrangeTopUp = async () => {
    if (!isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const { topupId, paymentUrl } = await createOrangeTopUp({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.id,
      });

      localStorage.setItem(
        "pendingOrangeTopUp",
        JSON.stringify({ topupId }),
      );

      window.location.href = paymentUrl;
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : err.message || "Orange Money top up failed";
      console.error("Orange Money top up error:", err.response?.data || err);
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfiTopUp = async () => {
    if (!isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const { topupId, payUrl } = await createTransfiTopUp({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.id,
      });

      localStorage.setItem(
        "pendingTransfiTopUp",
        JSON.stringify({ topupId }),
      );

      window.location.href = payUrl;
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : err.message || "Zamtel top up failed";
      console.error("Transfi top up error:", err.response?.data || err);
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const momoStatusLabel: Record<string, string> = {
    initiating: "Sending payment request to your phone...",
    pending: "Waiting for approval on your phone...",
    SUCCESSFUL: "Payment successful!",
    FAILED: "Payment failed",
    timeout: "Request timed out. Please try again.",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Top Up Wallet</DialogTitle>
        </DialogHeader>

        {isMobileMoney ? (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm text-blue-700 dark:text-blue-300">
              Topping up via {paymentMethod?.provider === "orange_money" ? "Orange Money" : paymentMethod?.provider === "transfi_zamtel" ? "Zamtel" : "Mobile Money"} —{" "}
              {paymentMethod?.phoneNumber} ({paymentMethod?.countryCode})
            </div>

            <div>
              <Label>Amount ({momoCurrency || "local currency"})</Label>
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
            </div>

            {usdEstimate > 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ≈ ${usdEstimate.toFixed(2)} USD
              </p>
            )}

            {momoStatus && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {momoStatusLabel[momoStatus] || momoStatus}
              </p>
            )}

            <Textarea
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
            />

            {isOrangeMoney ? (
              <Button
                onClick={handleOrangeTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-linear-to-r from-orange-500 to-red-500"
              >
                {loading ? "Redirecting..." : "Pay with Orange Money"}
              </Button>
            ) : isTransfi ? (
              <Button
                onClick={handleTransfiTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-linear-to-r from-blue-600 to-teal-600"
              >
                {loading ? "Redirecting..." : "Pay with Zamtel"}
              </Button>
            ) : (
              <Button
                onClick={handleMoMoTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-linear-to-r from-green-500 to-teal-500"
              >
                {loading ? "Processing..." : "Top Up with MoMo"}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
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

            <Textarea
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />

            <Button
              onClick={handleStripeTopUp}
              disabled={loading || !stripe || !isValidAmount}
              className="w-full"
            >
              {loading ? "Processing…" : "Top Up"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}