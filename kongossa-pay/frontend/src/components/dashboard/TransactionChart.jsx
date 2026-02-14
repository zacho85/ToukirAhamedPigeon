
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, TrendingUp, BarChart3 } from 'lucide-react';
import { useTranslation } from '@/components/common/LanguageProvider';

const barDataStatic = [
  { name: 'Mon', send: 400, receive: 240, deposit: 100, withdraw: 50 },
  { name: 'Tue', send: 300, receive: 139, deposit: 200, withdraw: 80 },
  { name: 'Wed', send: 200, receive: 980, deposit: 150, withdraw: 120 },
  { name: 'Thu', send: 278, receive: 390, deposit: 300, withdraw: 200 },
  { name: 'Fri', send: 189, receive: 480, deposit: 250, withdraw: 150 },
  { name: 'Sat', send: 239, receive: 380, deposit: 180, withdraw: 90 },
  { name: 'Sun', send: 349, receive: 430, deposit: 220, withdraw: 110 },
];

export default function TransactionChart({ transactions }) {
  const [viewType, setViewType] = useState('bar');
  const { t } = useTranslation();

  // Dynamically translate pieData names
  const pieData = [
    { name: t('transaction.send_money'), value: 1949, color: '#ef4444' },
    { name: t('transaction.receive_money'), value: 3039, color: '#22c55e' },
    { name: t('transaction.deposits_label'), value: 1400, color: '#8b5cf6' },
    { name: t('transaction.withdrawals_label'), value: 800, color: '#f97316' },
  ];

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{t('dashboard.transactions_overview')}</CardTitle>
          <p className="text-sm text-slate-500">{t('dashboard.financial_activity_this_week')}</p>
        </div>
        <Tabs value={viewType} onValueChange={setViewType}>
          <TabsList className="bg-slate-100">
            <TabsTrigger value="bar">
              <BarChart3 className="w-4 h-4 mr-1" />
              {t('common.bar')}
            </TabsTrigger>
            <TabsTrigger value="pie">
              <TrendingUp className="w-4 h-4 mr-1" />
              {t('common.pie')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('transaction.sent')}</p>
              <p className="font-bold text-slate-800">$1,949</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('transaction.received')}</p>
              <p className="font-bold text-slate-800">$3,039</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowDown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('transaction.deposits')}</p>
              <p className="font-bold text-slate-800">$1,400</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <ArrowUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{t('transaction.withdrawals')}</p>
              <p className="font-bold text-slate-800">$800</p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            {viewType === 'bar' ? (
              <BarChart data={barDataStatic} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="send" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="receive" fill="#22c55e" radius={[2, 2, 0, 0]} />
                <Bar dataKey="deposit" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="withdraw" fill="#f97316" radius={[2, 2, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${value}`, t('common.amount')]}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend for Pie Chart */}
        {viewType === 'pie' && (
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-slate-600">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
