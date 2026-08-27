import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cashIn } from "@/modules/agents/api";

export default function CashInPage() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await cashIn(userEmail, Number(amount), notes || undefined);
      setSuccess(true);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Cash-in failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="text-emerald-600 text-2xl">✓</span>
        </div>
        <h1 className="text-lg font-bold text-[#0B1226]">Cash-in complete</h1>
        <p className="text-sm text-gray-500">
          ${Number(amount).toFixed(2)} credited to {userEmail}'s wallet.
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

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Cash In</h1>
      <p className="text-sm text-gray-500">
        The customer hands you physical cash -- their wallet gets credited instantly.
      </p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
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
          {loading ? "Processing..." : "Confirm cash-in"}
        </button>
      </form>
    </div>
  );
}
