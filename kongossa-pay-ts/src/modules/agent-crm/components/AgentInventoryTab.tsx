import { useEffect, useState } from "react";
import { getAgentDayHistory, getInventory } from "../api";
import type { AgentInventory, DaySettlement } from "../api";

const money = (n: number | string) => `$${Number(n).toFixed(2)}`;

/** An agent's current cash and day settlement history, for admins. */
export default function AgentInventoryTab({ agentId }: { agentId: number }) {
  const [inventory, setInventory] = useState<AgentInventory | null>(null);
  const [history, setHistory] = useState<DaySettlement[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getInventory(agentId), getAgentDayHistory(agentId)])
      .then(([inv, days]) => {
        setInventory(inv);
        setHistory(days);
      })
      .catch(() => setError("Could not load this agent's inventory."));
  }, [agentId]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!inventory) return <p className="text-sm text-muted-foreground">Loading...</p>;

  const day = inventory.currentDay;
  const settled = history.filter((h) => h.status !== "open");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Cash on hand</p>
          <p className="text-xl font-bold tabular-nums">{money(inventory.cashOnHand)}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Max cash on hand</p>
          <p className="text-xl font-bold tabular-nums">{money(inventory.maxCashOnHand)}</p>
        </div>
      </div>

      <div className="border rounded-lg p-3 text-sm">
        <p className="font-medium mb-2">Today</p>
        {day ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="text-muted-foreground">Started</span>
            <span className="text-right">{new Date(day.startedAt).toLocaleString()}</span>
            <span className="text-muted-foreground">Opening cash</span>
            <span className="text-right tabular-nums">{money(day.startCash)}</span>
            <span className="text-muted-foreground">Cash in</span>
            <span className="text-right tabular-nums text-green-600">+{money(day.totalCashIn)}</span>
            <span className="text-muted-foreground">Cash out</span>
            <span className="text-right tabular-nums text-red-600">−{money(day.totalCashOut)}</span>
            <span className="text-muted-foreground">Expected cash now</span>
            <span className="text-right tabular-nums font-semibold">{money(day.expectedCash)}</span>
            <span className="text-muted-foreground">Commission</span>
            <span className="text-right tabular-nums">{money(day.totalCommission)}</span>
          </div>
        ) : (
          <p className="text-muted-foreground">The agent has not started a day.</p>
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Settled days</p>
        {settled.length === 0 ? (
          <p className="text-xs text-muted-foreground">No settled days yet.</p>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium p-2">Date</th>
                  <th className="text-right font-medium p-2">Opening</th>
                  <th className="text-right font-medium p-2">In</th>
                  <th className="text-right font-medium p-2">Out</th>
                  <th className="text-right font-medium p-2">Expected</th>
                  <th className="text-right font-medium p-2">Counted</th>
                  <th className="text-right font-medium p-2">Variance</th>
                </tr>
              </thead>
              <tbody>
                {settled.map((s) => {
                  const v = Number(s.variance);
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">{new Date(s.settlementDate).toLocaleDateString()}</td>
                      <td className="p-2 text-right tabular-nums">{money(s.startCash)}</td>
                      <td className="p-2 text-right tabular-nums">{money(s.totalCashIn)}</td>
                      <td className="p-2 text-right tabular-nums">{money(s.totalCashOut)}</td>
                      <td className="p-2 text-right tabular-nums">{money(s.expectedEndCash)}</td>
                      <td className="p-2 text-right tabular-nums">{money(s.endCash)}</td>
                      <td
                        className={`p-2 text-right tabular-nums font-medium ${
                          v < 0 ? "text-red-600" : v > 0 ? "text-amber-600" : "text-muted-foreground"
                        }`}
                      >
                        {v > 0 ? "+" : ""}
                        {v.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
