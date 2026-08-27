import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getCurrentDay } from "@/modules/agents/api";

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

  useEffect(() => {
    Promise.all([getDashboardStats(), getCurrentDay()])
      .then(([statsData, dayData]) => {
        setStats(statsData);
        setCurrentDay(dayData);
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
          className={`rounded-2xl p-4 bg-white shadow-sm text-center font-medium ${
            dayOpen ? "text-[#0B1226]" : "pointer-events-none text-gray-300"
          }`}
        >
          Cash Out
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

      {(stats?.pendingTransactions ?? 0) > 0 && (
        <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-700">
          {stats?.pendingTransactions} cash-out(s) awaiting customer OTP confirmation.
        </div>
      )}

      <Link
        to="/float-request"
        className="block bg-white rounded-2xl p-4 shadow-sm text-center text-sm font-medium text-[#0B1226]"
      >
        Request more float
      </Link>
    </div>
  );
}
