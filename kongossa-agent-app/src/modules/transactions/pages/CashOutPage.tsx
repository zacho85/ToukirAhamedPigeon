import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cashOut, confirmCashOut } from "@/modules/agents/api";

type Step = "form" | "otp" | "success";

export default function CashOutPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [userEmail, setUserEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await cashOut(userEmail, Number(amount), notes || undefined);
      if (result.requiresOtp) {
        setPendingId(result.id);
        setStep("otp");
      } else {
        setStep("success");
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Cash-out failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingId) return;
    setError("");
    setLoading(true);
    try {
      await confirmCashOut(pendingId, code);
      setStep("success");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid or expired code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (step === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="text-emerald-600 text-2xl">✓</span>
        </div>
        <h1 className="text-lg font-bold text-[#0B1226]">Cash-out complete</h1>
        <p className="text-sm text-gray-500">
          ${Number(amount).toFixed(2)} paid out to {userEmail}.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-[#0B1226]">Confirm with customer</h1>
        <p className="text-sm text-gray-500">
          This amount is above the instant-confirm threshold. Ask {userEmail} for the 6-digit
          code sent to their email.
        </p>
        <form onSubmit={onSubmitOtp} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em]"
            placeholder="------"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "Confirming..." : "Confirm"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Cash Out</h1>
      <p className="text-sm text-gray-500">
        The customer's wallet is debited and you hand over physical cash.
      </p>

      <form onSubmit={onSubmitForm} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer email</label>
          <input
            type="email"
            required
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="customer@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Processing..." : "Confirm cash-out"}
        </button>
      </form>
    </div>
  );
}
