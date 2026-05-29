import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { checkTransfiStatus } from "../api";
import { syncCurrentUser } from "@/lib/dispatch";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type PaymentState = "verifying" | "success" | "failed" | "not-found";

export default function TransfiPaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentState>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const orderId = searchParams.get("orderId");

    const stored = localStorage.getItem("pendingTransfiTopUp");
    let topupId: number | null = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        topupId = parsed.topupId;
      } catch {
        // ignore
      }
    }

    if (!topupId) {
      setState("not-found");
      setMessage("No pending top-up session found.");
      return;
    }

    const pollStatus = async () => {
      try {
        const result = await checkTransfiStatus(topupId!, orderId || undefined);
        if (result.status === "fund_settled") {
          setState("success");
          setMessage(
            `Payment successful! $${result.amountAdded?.toFixed(2) || ""} added to your wallet.`,
          );
          await syncCurrentUser();
          localStorage.removeItem("pendingTransfiTopUp");
          return;
        }
        if (result.status === "fund_failed") {
          setState("failed");
          setMessage("Payment failed. Please try again.");
          localStorage.removeItem("pendingTransfiTopUp");
          return;
        }
      } catch {
        // status check failed, try again
      }
      setTimeout(pollStatus, 3000);
    };

    const timeout = setTimeout(() => {
      setState("failed");
      setMessage("Payment verification timed out. Check your wallet balance.");
      localStorage.removeItem("pendingTransfiTopUp");
    }, 60000);

    pollStatus();

    return () => clearTimeout(timeout);
  }, [searchParams, navigate]);

  const handleRedirect = () => {
    navigate("/wallet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
        {state === "verifying" && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-blue-500 animate-spin" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Verifying Payment
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Please wait while we confirm your Zamtel payment...
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto text-emerald-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Payment Successful!
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
            <button
              onClick={handleRedirect}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors font-medium"
            >
              Go to Wallet
            </button>
          </>
        )}

        {state === "failed" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-red-500" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Payment Failed
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
            <button
              onClick={handleRedirect}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
            >
              Try Again
            </button>
          </>
        )}

        {state === "not-found" && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-slate-400" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Invalid Return
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
            <button
              onClick={handleRedirect}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
            >
              Go to Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
