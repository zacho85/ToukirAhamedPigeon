import { Card, CardContent } from "@/components/ui/card";
import { Percent, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface PlatformStats {
  totalFeeBalance: number;
  totalTransactionFee: number;
  totalFeePayout: number;
}

export default function TransactionFeeCard({
  stats,
}: {
  stats: PlatformStats;
}) {
  return (
    <Card>
      <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Percent className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="text-xs md:text-sm uppercase text-slate-500 dark:text-slate-400">
            Transaction Fees
          </p>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">
          ${Number(stats.totalFeeBalance || 0).toFixed(2)}
        </h3>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Fees</p>
              <p className="font-semibold text-sm md:text-base">
                ${Number(stats.totalTransactionFee || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-start justify-end gap-2 text-right">
            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400 mt-1" />
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Fee Payout</p>
              <p className="font-semibold text-red-600 dark:text-red-400 text-sm md:text-base">
                ${Number(stats.totalFeePayout || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}