import { Card, CardContent } from "@/components/ui/card";
import { Landmark, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface PlatformStats {
  platformBalance: number;
  totalTopUp: number;
  totalPayout: number;
}

export default function PlatformBalanceCard({
  stats,
}: {
  stats: PlatformStats;
}) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm uppercase text-slate-500">Platform Balance</p>
        </div>

        <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          ${stats.platformBalance.toLocaleString()}
        </h3>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-start gap-2">
            <ArrowDownLeft className="w-4 h-4 text-green-600 mt-1" />
            <div>
              <p className="text-xs text-slate-500">Total Top Up</p>
              <p className="font-semibold text-green-600">
                ${stats.totalTopUp.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-start justify-end gap-2 text-right">
            <ArrowUpRight className="w-4 h-4 text-red-600 mt-1" />
            <div>
              <p className="text-xs text-slate-500">Total Pay Out</p>
              <p className="font-semibold text-red-600">
                ${stats.totalPayout.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
