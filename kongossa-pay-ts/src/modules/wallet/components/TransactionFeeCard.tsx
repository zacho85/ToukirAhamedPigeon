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
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Percent className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm uppercase text-slate-500">
            Transaction Fees
          </p>
        </div>

        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          ${Number(stats.totalFeeBalance || 0).toFixed(2)}
        </h3>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-start gap-2">
            <ArrowDownLeft className="w-4 h-4 text-green-600 mt-1" />
            <div>
              <p className="text-xs text-slate-500">Total Fees</p>
              <p className="font-semibold">
                ${Number(stats.totalTransactionFee || 0).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-start justify-end gap-2 text-right">
            <ArrowUpRight className="w-4 h-4 text-red-600 mt-1" />
            <div>
              <p className="text-xs text-slate-500">Fee Payout</p>
              <p className="font-semibold text-red-600">
                ${Number(stats.totalFeePayout || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
