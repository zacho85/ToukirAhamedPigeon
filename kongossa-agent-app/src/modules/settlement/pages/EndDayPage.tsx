import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { endDay } from "@/modules/agents/api";

interface Settlement {
  startCash: number;
  endCash: number;
  totalCashIn: number;
  totalCashOut: number;
  totalCommission: number;
  expectedEndCash: number;
  variance: number;
}

export default function EndDayPage() {
  const navigate = useNavigate();
  const [endCash, setEndCash] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Settlement | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const settlement = await endDay(Number(endCash), notes || undefined);
      setResult(settlement);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not end your day.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const varianceOk = Math.abs(Number(result.variance)) < 0.01;
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-[#0B1226]">Day settled</h1>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <Row label="Starting cash" value={result.startCash} />
          <Row label="Total cash in" value={result.totalCashIn} />
          <Row label="Total cash out" value={result.totalCashOut} />
          <Row label="Commission earned" value={result.totalCommission} highlight />
          <Row label="Expected ending cash" value={result.expectedEndCash} />
          <Row label="Actual ending cash" value={result.endCash} />
          <div
            className={`rounded-xl p-3 text-sm font-medium ${
              varianceOk ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {varianceOk
              ? "Cash matches exactly -- no variance."
              : `Variance: ${result.variance > 0 ? "+" : ""}${Number(result.variance).toFixed(2)}`}
          </div>
        </div>
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
      <h1 className="text-lg font-bold text-[#0B1226]">End your day</h1>
      <p className="text-sm text-gray-500">Count your physical cash and enter the total below.</p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ending cash</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={endCash}
            onChange={(e) => setEndCash(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Ending day..." : "End day"}
        </button>
      </form>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? "text-emerald-600" : "text-[#0B1226]"}`}>
        ${Number(value).toFixed(2)}
      </span>
    </div>
  );
}
