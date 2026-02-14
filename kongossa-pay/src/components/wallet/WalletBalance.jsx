import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function WalletBalance({ user }) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Main Balance Card */}
      <Card className="overflow-hidden bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white">
        <CardContent className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-200 text-sm font-medium uppercase tracking-wider">
                Available Balance
              </p>
              <div className="flex items-center gap-3 mt-3">
                <h2 className="text-4xl font-bold">
                  {balanceVisible 
                    ? `$${(user?.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
                    : '••••••'
                  }
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="text-white hover:bg-white/20"
                >
                  {balanceVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            
            <div className="text-right">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-green-300 text-sm font-medium">+0.00%</p>
              <p className="text-blue-200 text-xs">This month</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wide">Currency</p>
              <p className="text-xl font-semibold mt-1">{user?.currency || 'USD'}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-wide">Rewards</p>
              <p className="text-xl font-semibold mt-1">{user?.rewards_points || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Money In</p>
                  <p className="text-xl font-bold text-slate-900">$0.00</p>
                </div>
              </div>
              <p className="text-green-600 text-sm font-medium">This month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Money Out</p>
                  <p className="text-xl font-bold text-slate-900">$0.00</p>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium">This month</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}