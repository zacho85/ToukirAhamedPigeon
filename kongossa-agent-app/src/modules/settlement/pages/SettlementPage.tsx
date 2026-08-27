import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentDay, getDayHistory } from "@/modules/agents/api";

interface Settlement {
  id: number;
  settlementDate: string;
  startCash: number;
  endCash: number;
  totalCashIn: number;
  totalCashOut: number;
  variance: number;
  status: string;
}

export default function SettlementPage() {
  const [current, setCurrent] = useState<Settlement | null>(null);
  const [history, setHistory] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCurrentDay(), getDayHistory()])
      .then(([currentData, historyData]) => {
        setCurrent(currentData);
        setHistory(historyData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Day settlement</h1>

      <div
        className={`rounded-2xl p-4 flex items-center justify-between ${
          current ? "bg-emerald-50" : "bg-amber-50"
        }`}
      >
        <div>
          <p className="text-sm font-medium text-gray-700">
            {current ? "Day in progress" : "No day open"}
          </p>
          {current && (
            <p className="text-xs text-gray-500">
              Started with ${Number(current.startCash).toFixed(2)}
            </p>
          )}
        </div>
        <Link
          to={current ? "/settlement/end-day" : "/settlement/start-day"}
          className="bg-[#0B1226] text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          {current ? "End day" : "Start day"}
        </Link>
      </div>

      <div>
        <p className="text-sm font-semibold text-[#0B1226] mb-2">History</p>
        <div className="space-y-2">
          {history.length === 0 && (
            <p className="text-sm text-gray-400 bg-white rounded-2xl p-4 shadow-sm">
              No settled days yet.
            </p>
          )}
          {history.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-[#0B1226]">
                  {new Date(s.settlementDate).toLocaleDateString()}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    s.status === "settled"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                <span>In: ${Number(s.totalCashIn).toFixed(2)}</span>
                <span>Out: ${Number(s.totalCashOut).toFixed(2)}</span>
                <span>
                  Variance:{" "}
                  <span className={Number(s.variance) === 0 ? "text-emerald-600" : "text-red-600"}>
                    {Number(s.variance).toFixed(2)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
