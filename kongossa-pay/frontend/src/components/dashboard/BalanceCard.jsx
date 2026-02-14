
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from '@/components/common/LanguageProvider';

export default function BalanceCard({ user, onAddMoney }) {
  const { t } = useTranslation();
  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl shadow-xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-slate-400">{t('dashboard.your_balance')}</p>
            <h2 className="text-3xl font-bold mt-1">
              ${(user?.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div>
            <p className="text-sm text-slate-400 text-right">{t('dashboard.rewards')}</p>
            <h2 className="text-xl font-bold mt-1 text-amber-400">{user?.rewards_points || 0} Point</h2>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
            <p className="text-sm font-mono text-slate-400">**** **** **** 1234</p>
            <Button onClick={onAddMoney} size="sm" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20">
                <Plus className="w-4 h-4 me-2" />
                {t('dashboard.add_money')}
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
