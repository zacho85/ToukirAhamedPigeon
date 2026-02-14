import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';

const data = [
  { name: 'Sun', value: 4000 },
  { name: 'Mon', value: 3000 },
  { name: 'Tue', value: 6000 },
  { name: 'Wed', value: 5800 },
  { name: 'Thu', value: 7800 },
  { name: 'Fri', value: 6390 },
  { name: 'Sat', value: 8490 },
];

export default function MoneyStatsChart() {
    const [timeframe, setTimeframe] = useState('7days');
    
  return (
    <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ArrowDown className="w-4 h-4 text-emerald-600"/>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Income</p>
                        <p className="font-bold text-slate-800">$983.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <ArrowUp className="w-4 h-4 text-red-600"/>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500">Expense</p>
                        <p className="font-bold text-slate-800">$983.0</p>
                    </div>
                </div>
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <Button onClick={() => setTimeframe('7days')} size="sm" variant={timeframe === '7days' ? 'default' : 'ghost'} className="text-xs h-7">Last 7 Days</Button>
                <Button onClick={() => setTimeframe('30days')} size="sm" variant={timeframe === '30days' ? 'default' : 'ghost'} className="text-xs h-7">30 Days</Button>
                <Button onClick={() => setTimeframe('custom')} size="sm" variant={timeframe === 'custom' ? 'default' : 'ghost'} className="text-xs h-7">Custom</Button>
            </div>
        </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                }}
                cursor={{ stroke: '#3B82F6', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}