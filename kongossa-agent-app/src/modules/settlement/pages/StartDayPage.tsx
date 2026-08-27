import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { startDay } from "@/modules/agents/api";

export default function StartDayPage() {
  const navigate = useNavigate();
  const [startCash, setStartCash] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await startDay(Number(startCash));
      navigate("/dashboard");
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not start your day.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Start your day</h1>
      <p className="text-sm text-gray-500">
        Enter the cash you're beginning the day with -- this is your opening float.
      </p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starting cash</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={startCash}
            onChange={(e) => setStartCash(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="0.00"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Starting..." : "Start day"}
        </button>
      </form>
    </div>
  );
}
