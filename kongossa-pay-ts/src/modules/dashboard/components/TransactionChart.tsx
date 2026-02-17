import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDown,
  ArrowUp,
  TrendingUp,
  BarChart3,
} from "lucide-react";

type ViewType = "bar" | "pie";

type BarData = {
  name: string;
  send: number;
  receive: number;
  deposit: number;
  withdraw: number;
};

type PieData = {
  key: string;
  name: string;
  value: number;
  color: string;
};

const barDataStatic: BarData[] = [
  { name: "Mon", send: 400, receive: 240, deposit: 100, withdraw: 50 },
  { name: "Tue", send: 300, receive: 139, deposit: 200, withdraw: 80 },
  { name: "Wed", send: 200, receive: 980, deposit: 150, withdraw: 120 },
  { name: "Thu", send: 278, receive: 390, deposit: 300, withdraw: 200 },
  { name: "Fri", send: 189, receive: 480, deposit: 250, withdraw: 150 },
  { name: "Sat", send: 239, receive: 380, deposit: 180, withdraw: 90 },
  { name: "Sun", send: 349, receive: 430, deposit: 220, withdraw: 110 },
];

export type Transaction = {
  type: "send" | "receive" | "deposit" | "withdraw";
  amount: number;
  date: string; // ISO string
}

interface TransactionChartProps {
  transactions: Transaction[];
}


export default function TransactionChart({transactions}: TransactionChartProps) {
  const [viewType, setViewType] = useState<ViewType>("bar");
  console.log(transactions);

  const pieData: PieData[] = useMemo(
    () => [
      {
        key: "send",
        name: "Send Money",
        value: 1949,
        color: "#ef4444",
      },
      {
        key: "receive",
        name: "Receive Money",
        value: 3039,
        color: "#22c55e",
      },
      {
        key: "deposit",
        name: "Deposit",
        value: 1400,
        color: "#8b5cf6",
      },
      {
        key: "withdraw",
        name: "Withdraw",
        value: 800,
        color: "#f97316",
      },
    ],
    []
  );

  const summaryStats = useMemo(
    () => [
      {
        key: "send",
        label: "Send Money",
        value: "$1,949",
        icon: ArrowUp,
        bg: "bg-red-100",
        color: "text-red-600",
      },
      {
        key: "receive",
        label: "Receive Money",
        value: "$3,039",
        icon: ArrowDown,
        bg: "bg-green-100",
        color: "text-green-600",
      },
      {
        key: "deposit",
        label: "Deposit",
        value: "$1,400",
        icon: ArrowDown,
        bg: "bg-purple-100",
        color: "text-purple-600",
      },
      {
        key: "withdraw",
        label: "Withdraw",
        value: "$800",
        icon: ArrowUp,
        bg: "bg-orange-100",
        color: "text-orange-600",
      },
    ],
    []
  );

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold">
            Transactions Overview
          </CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Weekly Activity
          </p>
        </div>

        <Tabs value={viewType} onValueChange={(v) => setViewType(v as ViewType)}>
          <TabsList className="bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="bar" className="cursor-pointer">
              <BarChart3 className="w-4 h-4 mr-1" />
              Bar
            </TabsTrigger>
            <TabsTrigger value="pie" className="cursor-pointer">
              <TrendingUp className="w-4 h-4 mr-1" />
              Pie
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryStats.map(({ key, icon: Icon, ...item }) => (
            <div key={key} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="w-full h-[300px]">
          <ResponsiveContainer>
            {viewType === "bar" ? (
              <BarChart data={barDataStatic}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="send" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="receive" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deposit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdraw" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                >
                  {pieData.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [`$${v}`, n]} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie Legend */}
        {viewType === "pie" && (
          <div className="flex flex-wrap justify-center gap-6 mt-4">
            {pieData.map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
