import { useEffect, useState } from "react";
import { getMyTransactions } from "@/modules/agents/api";

interface CashTransaction {
  id: number;
  type: string;
  amount: number;
  commission: number;
  status: string;
  reference: string;
  description: string | null;
  createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  pending_otp: "bg-amber-100 text-amber-700",
  pending: "bg-gray-100 text-gray-600",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTransactions()
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center text-gray-400 mt-10">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Transactions</h1>

      {transactions.length === 0 && (
        <p className="text-sm text-gray-400 bg-white rounded-2xl p-4 shadow-sm">
          No transactions yet.
        </p>
      )}

      <div className="space-y-2">
        {transactions.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-[#0B1226] capitalize">
                  {t.type.replace("_", " ")}
                </p>
                <p className="text-xs text-gray-400">{t.reference}</p>
              </div>
              <p
                className={`font-semibold ${
                  t.type === "cash_in" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {t.type === "cash_in" ? "+" : "-"}${Number(t.amount).toFixed(2)}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">
                {new Date(t.createdAt).toLocaleString()}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  STATUS_STYLE[t.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {t.status.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
