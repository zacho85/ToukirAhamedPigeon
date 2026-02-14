import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function StatsOverview({ transactions }) {
  const stats = [
    {
      title: "Total Sent",
      value: "$0.00",
      change: "+0%",
      changeType: "positive",
      icon: ArrowUpRight,
      color: "text-red-600"
    },
    {
      title: "Total Received", 
      value: "$0.00",
      change: "+0%",
      changeType: "positive",
      icon: ArrowDownLeft,
      color: "text-green-600"
    },
    {
      title: "Transactions",
      value: transactions.length,
      change: "+0",
      changeType: "neutral",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Success Rate",
      value: "100%",
      change: "+0%",
      changeType: "positive", 
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-3 h-3 ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-10 ${stat.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}