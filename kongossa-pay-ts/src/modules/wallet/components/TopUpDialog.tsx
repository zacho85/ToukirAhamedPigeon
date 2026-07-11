// src/modules/wallet/components/TopUpDialog.tsx
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
import {
  createTopUpIntent,
  createMoMoTopUp,
  checkMoMoStatus,
  createOrangeTopUp,
  createTransfiTopUp,
  createMpesaTopUp,
  checkMpesaStatus,
  createPaystackTopUp,
  createFlutterwaveTopUp,
  createAirtelTopUp,
  checkAirtelStatus,
} from "../api";
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
    paymentMethod?.provider === "mpesa" ||
    paymentMethod?.provider === "airtel_money" ||
    paymentMethod?.type === "mobile_money";

  const isOrangeMoney = paymentMethod?.provider === "orange_money";
  const isTransfi = paymentMethod?.provider === "transfi_zamtel";
  const isMpesa = paymentMethod?.provider === "mpesa";
  const isAirtel = paymentMethod?.provider === "airtel_money";
  const isPaystack = paymentMethod?.provider === "paystack";
  const isFlutterwave = paymentMethod?.provider === "flutterwave";
  const isPaymentGateway = isPaystack || isFlutterwave;

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

  // ---- Stripe ----
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
      const { clientSecret } = await createTopUpIntent({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.stripePmId,
        remarks,
      });

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret
      );

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

  // ---- MTN MoMo ----
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
              message: `Top up successful! $${result.amountAdded?.toFixed(
                2
              )} added to wallet.`,
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

  // ---- Orange Money ----
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

      localStorage.setItem("pendingOrangeTopUp", JSON.stringify({ topupId }));
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

  // ---- Transfi (Zamtel) ----
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

      localStorage.setItem("pendingTransfiTopUp", JSON.stringify({ topupId }));
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

  // ---- M-Pesa ----
  const handleMpesaTopUp = async () => {
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
      const { topupId, message } = await createMpesaTopUp({
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
          const result = await checkMpesaStatus(topupId);
          setMomoStatus(result.status);

          if (result.status === "SUCCESSFUL") {
            clearInterval(pollInterval);
            dispatchShowToast({
              message: `Top up successful! $${result.amountAdded?.toFixed(
                2
              )} added to wallet.`,
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
              message: "M-Pesa payment failed. Please try again.",
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
          : err.message || "M-Pesa top up failed";
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Airtel Money ----
  const handleAirtelTopUp = async () => {
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
      const { topupId, message } = await createAirtelTopUp({
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
          const result = await checkAirtelStatus(topupId);
          setMomoStatus(result.status);

          if (result.status === "SUCCESSFUL") {
            clearInterval(pollInterval);
            dispatchShowToast({
              message: `Top up successful! $${result.amountAdded?.toFixed(
                2
              )} added to wallet.`,
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
              message: "Airtel Money payment failed. Please try again.",
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
          : err.message || "Airtel Money top up failed";
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Paystack ----
  const handlePaystackTopUp = async () => {
    if (!isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const { topupId, authorizationUrl } = await createPaystackTopUp({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.id,
      });

      localStorage.setItem("pendingPaystackTopUp", JSON.stringify({ topupId }));
      window.location.href = authorizationUrl;
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : err.message || "Paystack top up failed";
      console.error("Paystack top up error:", err.response?.data || err);
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Flutterwave ----
  const handleFlutterwaveTopUp = async () => {
    if (!isValidAmount) {
      dispatchShowToast({
        message: "Please enter a valid amount",
        type: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const { topupId, paymentLink } = await createFlutterwaveTopUp({
        amount: parsedAmount,
        paymentMethodId: paymentMethod?.id,
      });

      localStorage.setItem("pendingFlutterwaveTopUp", JSON.stringify({ topupId }));
      window.location.href = paymentLink;
    } catch (err: any) {
      const errorMsg =
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : err.message || "Flutterwave top up failed";
      console.error("Flutterwave top up error:", err.response?.data || err);
      dispatchShowToast({
        message: errorMsg,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Status labels ----
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
          // ---- Mobile Money (MTN, Orange, Zamtel, M‑Pesa, Airtel) ----
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm text-blue-700 dark:text-blue-300">
              Topping up via{" "}
              {isOrangeMoney
                ? "Orange Money"
                : isTransfi
                ? "Zamtel"
                : isMpesa
                ? "M-Pesa"
                : isAirtel
                ? "Airtel Money"
                : "Mobile Money"}{" "}
              — {paymentMethod?.phoneNumber} ({paymentMethod?.countryCode})
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
            ) : isMpesa ? (
              <Button
                onClick={handleMpesaTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-linear-to-r from-green-600 to-emerald-600"
              >
                {loading ? "Processing..." : "Top Up with M-Pesa"}
              </Button>
            ) : isAirtel ? (
              <Button
                onClick={handleAirtelTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-linear-to-r from-red-600 to-orange-600"
              >
                {loading ? "Processing..." : "Top Up with Airtel Money"}
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
        ) : isPaymentGateway ? (
          // ---- Payment Gateways (Paystack, Flutterwave) ----
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-md p-3 text-sm text-purple-700 dark:text-purple-300">
              Topping up via {isPaystack ? "Paystack" : "Flutterwave"} —{" "}
              {paymentMethod?.accountName}
            </div>

            <div>
              <Label>Amount (NGN)</Label>
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

            <Textarea
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
            />

            {isPaystack ? (
              <Button
                onClick={handlePaystackTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Redirecting..." : "Pay with Paystack"}
              </Button>
            ) : (
              <Button
                onClick={handleFlutterwaveTopUp}
                disabled={loading || !isValidAmount}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {loading ? "Redirecting..." : "Pay with Flutterwave"}
              </Button>
            )}
          </div>
        ) : (
          // ---- Stripe Card ----
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