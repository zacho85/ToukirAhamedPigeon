import { useCallback, useEffect, useState } from "react";
import {
  completeCashOut,
  declineCashOut,
  getCashOutRequests,
  getMyAgentProfile,
  type CashOutRequest,
} from "@/modules/agents/api";

const apiError = (err: unknown) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message;

const money = (n: number) => `$${Number(n).toFixed(2)}`;

/**
 * An agent never debits a customer's wallet. The customer starts a cash-out
 * in their own app with this agent's code and approves it with their OTP;
 * the approved request shows up here, and the wallet is debited only when
 * the agent hands over the cash and taps "Cash given".
 */
export default function CashOutPage() {
  const [agentCode, setAgentCode] = useState("");
  const [requests, setRequests] = useState<CashOutRequest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirming, setConfirming] = useState<CashOutRequest | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const refresh = useCallback(
    () =>
      getCashOutRequests()
        .then(setRequests)
        .catch((err) => setError(apiError(err) || "Could not load cash-out requests."))
        .finally(() => setLoaded(true)),
    [],
  );

  useEffect(() => {
    getMyAgentProfile()
      .then((profile) => setAgentCode(profile?.agentCode ?? ""))
      .catch(() => undefined);
  }, []);

  // New approvals arrive from the customer's phone, so keep the list fresh.
  useEffect(() => {
    getCashOutRequests()
      .then(setRequests)
      .catch((err) => setError(apiError(err) || "Could not load cash-out requests."))
      .finally(() => setLoaded(true));
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const onCashGiven = async (request: CashOutRequest) => {
    setError("");
    setBusyId(request.id);
    try {
      await completeCashOut(request.id);
      setDone(
        `${money(request.amount)} paid out to ${request.customer?.fullName || request.customer?.email}. Receipts sent.`,
      );
      setConfirming(null);
    } catch (err) {
      setError(apiError(err) || "Cash-out failed.");
      setConfirming(null);
    } finally {
      setBusyId(null);
      void refresh();
    }
  };

  const onDecline = async (request: CashOutRequest) => {
    setError("");
    setBusyId(request.id);
    try {
      await declineCashOut(request.id);
      setDone(`Request ${request.reference} declined. Nothing was debited.`);
    } catch (err) {
      setError(apiError(err) || "Could not decline the request.");
    } finally {
      setBusyId(null);
      void refresh();
    }
  };

  if (confirming) {
    const who = confirming.customer?.fullName || confirming.customer?.email;
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-[#0B1226]">Hand over the cash</h1>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3 text-sm">
          <div>
            <p className="text-gray-400">Customer</p>
            <p className="font-semibold text-[#0B1226] break-words">{who}</p>
            <p className="text-gray-500 break-all">{confirming.customer?.email}</p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-gray-400">Give this amount in cash</p>
            <p className="text-2xl font-bold text-[#0B1226]">{money(confirming.amount)}</p>
          </div>
          <p className="text-xs text-gray-400">
            Reference {confirming.reference}. Tap "Cash given" only after the customer has the cash:
            that is when their wallet is debited.
          </p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirming(null)}
            className="bg-white border border-gray-200 text-[#0B1226] font-medium py-3 rounded-xl"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => onCashGiven(confirming)}
            disabled={busyId === confirming.id}
            className="bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
          >
            {busyId === confirming.id ? "Saving..." : "Cash given"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Cash Out</h1>
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
        <p className="text-sm text-gray-500">
          The customer starts the cash-out in their own Kongossa Pay app (Wallet → Cash out at an agent)
          with your agent code, and approves it with their code.
        </p>
        <p className="text-xs text-gray-400">Your agent code</p>
        <p className="text-2xl font-bold tracking-wider text-[#0B1226] break-all">{agentCode || "—"}</p>
      </div>

      {done && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3">{done}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#0B1226]">Approved requests</h2>
        <button type="button" onClick={() => void refresh()} className="text-xs text-gray-500 underline">
          Refresh
        </button>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-sm text-gray-400 bg-white rounded-2xl shadow-sm p-5">
          No approved requests yet. This list updates by itself.
        </p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#0B1226] break-words">
                    {r.customer?.fullName || r.customer?.email}
                  </p>
                  <p className="text-xs text-gray-500 break-all">{r.customer?.email}</p>
                  <p className="text-xs text-gray-400 break-all">{r.reference}</p>
                </div>
                <p className="text-lg font-bold text-[#0B1226] shrink-0">{money(r.amount)}</p>
              </div>
              <p className="text-xs text-gray-400">
                Expires {new Date(r.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onDecline(r)}
                  disabled={busyId === r.id}
                  className="bg-white border border-gray-200 text-[#0B1226] font-medium py-2.5 rounded-xl disabled:opacity-60"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setDone("");
                    setConfirming(r);
                  }}
                  disabled={busyId === r.id}
                  className="bg-[#0B1226] text-white font-medium py-2.5 rounded-xl disabled:opacity-60"
                >
                  Pay out
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
