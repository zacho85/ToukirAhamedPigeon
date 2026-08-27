import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllAgents } from "../api";

interface Counts {
  total: number;
  pending: number;
  active: number;
  suspended: number;
  kycSubmitted: number;
}

export default function AgentCrmDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    Promise.all([
      getAllAgents({ limit: 1 }),
      getAllAgents({ status: "pending", limit: 1 }),
      getAllAgents({ status: "active", limit: 1 }),
      getAllAgents({ status: "suspended", limit: 1 }),
      getAllAgents({ kycStatus: "submitted", limit: 1 }),
    ]).then(([all, pending, active, suspended, kycSubmitted]) => {
      setCounts({
        total: all.total,
        pending: pending.total,
        active: active.total,
        suspended: suspended.total,
        kycSubmitted: kycSubmitted.total,
      });
    });
  }, []);

  const cards = [
    { label: "Total agents", value: counts?.total },
    { label: "Active", value: counts?.active },
    { label: "Pending approval", value: counts?.pending },
    { label: "KYC awaiting review", value: counts?.kycSubmitted },
    { label: "Suspended", value: counts?.suspended },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="p-4">
            <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="text-2xl font-bold">{c.value ?? "--"}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
