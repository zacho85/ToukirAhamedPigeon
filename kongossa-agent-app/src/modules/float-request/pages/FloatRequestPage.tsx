import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { createFloatRequest, getMyFloatRequests } from "@/modules/agents/api";

interface FloatRequest {
  id: number;
  amount: number;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function FloatRequestPage() {
  const [requests, setRequests] = useState<FloatRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    // GET /float-requests/mine returns the raw array directly, not the
    // {success, data} envelope agents.controller.ts's routes use.
    getMyFloatRequests()
      .then((res) => setRequests(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createFloatRequest(Number(amount), notes || undefined);
      setAmount("");
      setNotes("");
      setLoading(true);
      load();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not submit the request.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Request float</h1>
      <p className="text-sm text-gray-500">
        Ask the admin to increase your cash-on-hand allowance.
      </p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
          placeholder="Amount requested"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
          placeholder="Notes (optional)"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit request"}
        </button>
      </form>

      <div>
        <p className="text-sm font-semibold text-[#0B1226] mb-2">Your requests</p>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400 bg-white rounded-2xl p-4 shadow-sm">
            No float requests yet.
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm flex justify-between">
                <div>
                  <p className="font-medium text-[#0B1226]">${Number(r.amount).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`h-fit text-xs px-2 py-1 rounded-full ${
                    STATUS_STYLE[r.status] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
