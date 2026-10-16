import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownLeft, Copy, Check } from "lucide-react";

export default function WalletBalance({ user, stats }: { user: any, stats: any }) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  // Customers share this ID with an agent or a friend instead of their email.
  const copyId = async () => {
    if (!user?.kongossaId) return;
    try {
      await navigator.clipboard.writeText(user.kongossaId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: the ID is still visible to copy by hand */
    }
  };

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
      {/* Main Balance Card */}
      <Card className="overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
            <div>
              <p className="text-blue-200 text-xs md:text-sm font-medium uppercase tracking-wider">
                Available Balance
              </p>
              <div className="flex items-center gap-2 md:gap-3 mt-2 md:mt-3">
                <h2 className="text-2xl md:text-4xl font-bold break-all">
                  {balanceVisible
                    ? `$${(user?.walletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                    : '••••••'
                  }
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-white hover:bg-white/20 h-8 w-8 md:h-10 md:w-10"
                >
                  {balanceVisible ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </Button>
              </div>
            </div>

            <div className="text-right">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center mb-2 md:mb-3 mx-auto sm:mx-0">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <p className="text-green-300 text-xs md:text-sm font-medium">
                {stats.growthPercent >= 0 ? '+' : ''}
                {stats.growthPercent}%
              </p>
              <p className="text-blue-200 text-xs">This month</p>
            </div>
          </div>

          <div className="flex justify-between pt-4 md:pt-6 border-t border-white/20">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wide">Currency</p>
              <p className="text-lg md:text-xl font-semibold mt-1">{user?.currency || 'USD'}</p>
            </div>
            {user?.kongossaId && (
              <div className="text-center">
                <p className="text-blue-200 text-xs uppercase tracking-wide">KongossaPay ID</p>
                <button
                  type="button"
                  onClick={copyId}
                  title="Copy your KongossaPay ID"
                  className="inline-flex items-center gap-1.5 text-lg md:text-xl font-semibold mt-1 font-mono hover:text-blue-200"
                >
                  {user.kongossaId}
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 opacity-70" />}
                </button>
              </div>
            )}
            <div className="text-right">
              <p className="text-blue-200 text-xs uppercase tracking-wide">Rewards</p>
              <p className="text-lg md:text-xl font-semibold mt-1">{user?.rewardsPoints || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-3 md:space-y-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Money In</p>
                  <p className="text-base md:text-xl font-bold text-slate-900 dark:text-slate-100">${stats.moneyIn.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-green-600 dark:text-green-400 text-xs md:text-sm font-medium">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Money Out</p>
                  <p className="text-base md:text-xl font-bold text-slate-900 dark:text-slate-100">${stats.moneyOut.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">This month</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}