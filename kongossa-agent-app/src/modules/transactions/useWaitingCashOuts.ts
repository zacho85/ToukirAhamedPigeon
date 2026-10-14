import { useEffect, useState } from "react";
import { getCashOutRequests } from "@/modules/agents/api";
import type { CashOutRequest } from "@/modules/agents/api";

/**
 * Customer-approved cash-outs waiting for this agent's cash, polled every 5 s,
 * so the agent notices a new request on any page. A failed poll keeps the last list.
 */
export function useWaitingCashOuts(): CashOutRequest[] {
  const [requests, setRequests] = useState<CashOutRequest[]>([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      getCashOutRequests()
        .then((list) => alive && setRequests(list))
        .catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 5000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  return requests;
}
