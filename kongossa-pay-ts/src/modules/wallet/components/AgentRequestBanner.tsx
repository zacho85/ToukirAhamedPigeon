// src/modules/wallet/components/AgentRequestBanner.tsx
//
// Shown on every page except Wallet (which has the full Agent requests card):
// a transfer an agent started from this customer's wallet, or a cash-out
// waiting for the customer's code or for the agent's cash, must not go
// unnoticed. Clicking opens that request on the Wallet page.
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Banknote } from "lucide-react";

import { listAgentRequests, type AgentRequest } from "../api";

const money = (n: number) => `$${Number(n).toFixed(2)}`;

const describe = (r: AgentRequest) =>
  r.type === "transfer"
    ? `${r.agentName} wants to send ${money(r.amount)} from your wallet to ${r.recipient?.fullName || r.recipient?.email}.`
    : r.status === "awaiting_agent"
      ? `Collect ${money(r.amount)} in cash from ${r.agentName}.`
      : `Your ${money(r.amount)} cash-out at ${r.agentName} is waiting for your code.`;

const action = (r: AgentRequest) =>
  r.type === "transfer" ? "Review" : r.status === "awaiting_agent" ? "View" : "Enter code";

export default function AgentRequestBanner() {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const baseTitle = useRef(document.title);

  useEffect(() => {
    let alive = true;
    const load = () =>
      listAgentRequests()
        .then((list) => alive && setRequests(list))
        .catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    document.title = requests.length ? `(${requests.length}) ${baseTitle.current}` : baseTitle.current;
  }, [requests.length]);

  if (!requests.length || pathname.startsWith("/wallet")) return null;
  const first = requests[0];

  return (
    <button
      type="button"
      role="status"
      onClick={() => navigate(`/wallet?agentRequest=${first.id}`)}
      className="sticky top-16 z-30 w-full mb-4 flex items-center gap-3 rounded-xl bg-amber-400 px-4 py-3 text-left text-[#0B1226] shadow-sm"
    >
      <Banknote className="w-5 h-5 shrink-0" />
      <span className="flex-1 min-w-0 text-sm font-semibold break-words">
        {describe(first)}
        {requests.length > 1 && ` (+${requests.length - 1} more)`}
      </span>
      <span className="shrink-0 text-sm font-bold underline">{action(first)}</span>
    </button>
  );
}
