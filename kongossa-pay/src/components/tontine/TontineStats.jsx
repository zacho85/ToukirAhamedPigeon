import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users } from 'lucide-react';

export default function TontineStats({ tontines }) {
  const stats = React.useMemo(() => {
    const totalValue = tontines.reduce((acc, t) => acc + (t.total_pot || (t.contribution_amount * t.members?.length) || 0), 0);
    const activeTontines = tontines.filter(t => t.status === 'active').length;
    const totalMembers = tontines.reduce((acc, t) => acc + (t.members?.length || 0), 0);

    return [
      {
        title: "Total Value Locked",
        value: `$${totalValue.toLocaleString()}`,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      {
        title: "Active Tontines",
        value: activeTontines,
        icon: TrendingUp,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        title: "Total Participants",
        value: totalMembers,
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
    ];
  }, [tontines]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {stats.map((stat, index) => (
        <Card key={index} className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}