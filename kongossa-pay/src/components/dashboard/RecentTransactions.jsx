
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from '@/components/common/LanguageProvider';

export default function RecentTransactions({ transactions }) {
  const { t } = useTranslation();
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">{t('dashboard.latest_transactions')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to={createPageUrl("History")}>{t('common.view_all')}</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            {t('dashboard.no_transactions_yet')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">{t('dashboard.latest_transactions')}</CardTitle>
        <Button variant="ghost" size="sm" asChild>
            <Link to={createPageUrl("History")}>{t('common.view_all')}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 3).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                }`}>
                  <img src={`https://avatar.vercel.sh/${transaction.recipient_id}.png`} alt="Recipient" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {transaction.description?.split(' ')[2] || 'Zayn Malik'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {transaction.type === 'send' ? t('transaction_type.money_transfer') : t('transaction_type.money_received')}
                  </p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === 'send' ? 'text-red-600' : 'text-green-600'
              }`}>
                {transaction.type === 'send' ? '-' : '+'}${transaction.amount?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
