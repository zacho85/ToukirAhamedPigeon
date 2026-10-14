import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { getDashboardStats, getCurrentDay, getDailyCommission } from "@/modules/agents/api";
import type { DailyCommission } from "@/modules/agents/api";

interface DashboardStats {
  walletBalance: number;
  cashOnHand: number;
  maxCashOnHand: number;
  today: { transactions: number; volume: number; commission: number };
  pendingTransactions: number;
  agentCode: string;
}

interface DaySettlement {
  id: number;
  startCash: number;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentDay, setCurrentDay] = useState<DaySettlement | null>(null);
  const [loading, setLoading] = useState(true);
  const [daily, setDaily] = useState<DailyCommission[]>([]);
  const [showAllDays, setShowAllDays] = useState(false);
  const { waitingCashOuts = 0 } = useOutletContext<{ waitingCashOuts?: number }>() ?? {};

  useEffect(() => {
    Promise.all([getDashboardStats(), getCurrentDay(), getDailyCommission(30)])
      .then(([statsData, dayData, dailyData]) => {
        setStats(statsData);
        setCurrentDay(dayData);
        setDaily(dailyData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-center text-gray-400 mt-10">Loading...</p>;
  }

  const dayOpen = !!currentDay;

  return (
    <div className="space-y-5">
      <div className="bg-[#0B1226] rounded-2xl p-6 text-white">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Wallet balance</p>
        <p className="text-3xl font-bold mt-1">${(stats?.walletBalance ?? 0).toFixed(2)}</p>
        <div className="flex justify-between mt-4 pt-4 border-t border-white/10 text-sm">
          <div>
            <p className="text-gray-400">Cash on hand</p>
            <p className="font-semibold text-emerald-400">
              ${(stats?.cashOnHand ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400">Max limit</p>
            <p className="font-semibold">${(stats?.maxCashOnHand ?? 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl p-4 flex items-center justify-between ${
          dayOpen ? "bg-emerald-50" : "bg-amber-50"
        }`}
      >
        <div>
          <p className="text-sm font-medium text-gray-700">
            {dayOpen ? "Day in progress" : "Day not started"}
          </p>
          <p className="text-xs text-gray-500">
            {dayOpen
              ? `Started with $${Number(currentDay?.startCash ?? 0).toFixed(2)}`
              : "Start your day to begin processing transactions"}
          </p>
        </div>
        <Link
          to={dayOpen ? "/settlement/end-day" : "/settlement/start-day"}
          className="bg-[#0B1226] text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          {dayOpen ? "End day" : "Start day"}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/transactions/cash-in"
          aria-disabled={!dayOpen}
          className={`rounded-2xl p-4 bg-white shadow-sm text-center font-medium ${
            dayOpen ? "text-[#0B1226]" : "pointer-events-none text-gray-300"
          }`}
        >
          Cash In
        </Link>
        <Link
          to="/transactions/cash-out"
          aria-disabled={!dayOpen}
          className={`relative rounded-2xl p-4 bg-white shadow-sm text-center font-medium ${
            dayOpen ? "text-[#0B1226]" : "pointer-events-none text-gray-300"
          } ${waitingCashOuts > 0 ? "ring-2 ring-amber-400" : ""}`}
        >
          Cash Out
          {waitingCashOuts > 0 && (
            <span className="absolute -top-2 -right-2 min-w-6 h-6 px-1.5 rounded-full bg-amber-400 text-[#0B1226] text-xs font-bold flex items-center justify-center">
              {waitingCashOuts}
            </span>
          )}
        </Link>
        <Link
          to="/transactions/transfer"
          aria-disabled={!dayOpen}
          className={`col-span-2 rounded-2xl p-4 bg-white shadow-sm text-center font-medium ${
            dayOpen ? "text-[#0B1226]" : "pointer-events-none text-gray-300"
          }`}
        >
          Transfer between customers
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm font-semibold text-[#0B1226] mb-3">Today</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-400">Transactions</p>
            <p className="font-semibold">{stats?.today.transactions ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Volume</p>
            <p className="font-semibold">${(stats?.today.volume ?? 0).toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Commission</p>
            <p className="font-semibold text-emerald-500">
              ${(stats?.today.commission ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-baseline mb-3">
          <p className="text-sm font-semibold text-[#0B1226]">Commission by day</p>
          <p className="text-xs text-gray-400">
            Last {showAllDays ? 30 : 7} days: $
            {daily
              .slice(0, showAllDays ? 30 : 7)
              .reduce((sum, d) => sum + d.commission, 0)
              .toFixed(2)}
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400">
              <th className="text-left font-normal pb-1">Day</th>
              <th className="text-right font-normal pb-1">Transactions</th>
              <th className="text-right font-normal pb-1">Commission</th>
            </tr>
          </thead>
          <tbody>
            {daily.slice(0, showAllDays ? 30 : 7).map((d, i) => (
              <tr key={d.date} className="border-t border-gray-50">
                <td className="py-1.5 text-gray-600">
                  {i === 0
                    ? "Today"
                    : new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                </td>
                <td className="py-1.5 text-right tabular-nums text-gray-600">{d.transactions}</td>
                <td
                  className={`py-1.5 text-right tabular-nums font-medium ${
                    d.commission > 0 ? "text-emerald-600" : "text-gray-300"
                  }`}
                >
                  ${d.commission.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {daily.length > 7 && (
          <button
            type="button"
            onClick={() => setShowAllDays((v) => !v)}
            className="w-full mt-2 text-xs font-medium text-[#0B1226] py-2"
          >
            {showAllDays ? "Show last 7 days" : "Show 30 days"}
          </button>
        )}
      </div>

      {(stats?.pendingTransactions ?? 0) > 0 && (
        <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-700">
          {stats?.pendingTransactions} transaction(s) awaiting customer OTP confirmation.
        </div>
      )}

      <Link
        to="/pos/get-paid"
        className="block bg-[#0B1226] rounded-2xl p-4 shadow-sm text-center text-sm font-medium text-emerald-400"
      >
        Get paid (QR / payment link)
      </Link>

      <Link
        to="/float-request"
        className="block bg-white rounded-2xl p-4 shadow-sm text-center text-sm font-medium text-[#0B1226]"
      >
        Request more float
      </Link>
    </div>
  );
}
