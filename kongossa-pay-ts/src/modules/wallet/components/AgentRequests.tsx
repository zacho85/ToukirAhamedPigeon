// src/modules/wallet/components/AgentRequests.tsx
//
// The customer's side of agent money movements. An agent can never debit a
// customer's wallet: the customer starts a cash-out here with the agent's
// code and approves it with the emailed code, and approves (or rejects) any
// transfer an agent started for them. Codes are entered only here, never
// told to the agent.
import { useCallback, useEffect, useRef, useState } from "react";
import { Banknote, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { dispatchShowToast, syncUserProfile } from "@/lib/dispatch";
import {
  cancelAgentRequest,
  confirmAgentRequest,
  getAgentRequest,
  listAgentRequests,
  startAgentCashOut,
  type AgentRequest,
} from "../api";

type Step = "form" | "code" | "waiting" | "done" | "closed";

const money = (n: number) => `$${Number(n).toFixed(2)}`;

const apiError = (err: unknown) =>
  (err as { response?: { data?: { message?: string; code?: string } } })?.response?.data;

const closedMessage = (status: string) =>
  status === "declined"
    ? "The agent declined this cash-out. Nothing was taken from your wallet."
    : status === "expired"
      ? "This request expired. Nothing was taken from your wallet."
      : status === "cancelled"
        ? "This request was cancelled. Nothing was taken from your wallet."
        : "This request could not be completed. Nothing was taken from your wallet.";

/* ---------------- Dialog ---------------- */

function AgentRequestDialog({
  open,
  request,
  maxAmount,
  onClose,
  onChanged,
}: {
  open: boolean;
  /** Set to continue an existing request; null starts a new cash-out. */
  request: AgentRequest | null;
  maxAmount: number;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [step, setStep] = useState<Step>("form");
  const [current, setCurrent] = useState<AgentRequest | null>(null);
  const [agentCode, setAgentCode] = useState("");
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Opening the dialog decides where to start.
  useEffect(() => {
    if (!open) return;
    setCurrent(request);
    setStep(!request ? "form" : request.status === "awaiting_agent" ? "waiting" : "code");
    setAgentCode("");
    setAmount("");
    setCode("");
    setError("");
  }, [open, request]);

  // While the agent counts the cash, follow the request until it ends.
  useEffect(() => {
    if (!open || step !== "waiting" || !current) return;
    const timer = window.setInterval(async () => {
      try {
        const latest = await getAgentRequest(current.id);
        setCurrent(latest);
        if (latest.status === "completed") {
          setStep("done");
          await syncUserProfile();
          onChanged();
        } else if (latest.status !== "awaiting_agent") {
          setStep("closed");
          onChanged();
        }
      } catch {
        // Keep polling; a network blip is not a result.
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [open, step, current, onChanged]);

  const onStart = async () => {
    setError("");
    const value = Number(amount);
    if (!agentCode.trim() || !(value > 0)) {
      setError("Enter the agent code and an amount.");
      return;
    }
    if (value > maxAmount) {
      setError(`You can cash out at most ${money(maxAmount)}.`);
      return;
    }
    setLoading(true);
    try {
      const started = await startAgentCashOut(agentCode.trim(), value);
      setCurrent(await getAgentRequest(started.id));
      setStep("code");
      onChanged();
    } catch (err) {
      setError(apiError(err)?.message || "Could not start the cash-out.");
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    if (!current) return;
    setError("");
    setLoading(true);
    try {
      await confirmAgentRequest(current.id, code.trim());
      if (current.type === "transfer") {
        setStep("done");
        await syncUserProfile();
      } else {
        setCurrent(await getAgentRequest(current.id));
        setStep("waiting");
      }
      onChanged();
    } catch (err) {
      const data = apiError(err);
      setError(data?.message || "Invalid or expired code.");
      if (data?.code?.endsWith("_CANCELLED") || data?.code?.endsWith("_EXPIRED")) {
        setStep("closed");
        onChanged();
      }
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    if (!current) return;
    setLoading(true);
    try {
      const latest = await cancelAgentRequest(current.id);
      setCurrent(latest);
      setStep("closed");
      onChanged();
    } catch (err) {
      setError(apiError(err)?.message || "Could not cancel.");
    } finally {
      setLoading(false);
    }
  };

  const isTransfer = current?.type === "transfer";
  const title = isTransfer ? "Approve transfer" : "Cash out at an agent";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ask the agent for their agent code. Nothing leaves your wallet until the agent has given
              you the cash.
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Agent code</label>
              <Input
                value={agentCode}
                onChange={(e) => setAgentCode(e.target.value.toUpperCase())}
                placeholder="AG-..."
                autoCapitalize="characters"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-slate-500">Available: {money(maxAmount)}</p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button className="w-full" onClick={onStart} disabled={loading}>
              {loading ? "Sending code..." : "Continue"}
            </Button>
          </div>
        )}

        {step === "code" && current && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-1 text-sm">
              <p className="text-slate-500">{isTransfer ? "Send" : "Cash out"}</p>
              <p className="text-2xl font-bold">{money(current.amount)}</p>
              {isTransfer && current.recipient && (
                <p>
                  to <span className="font-medium">{current.recipient.fullName || current.recipient.email}</span>
                </p>
              )}
              <p className="text-slate-500 break-words">Agent: {current.agentName}</p>
              <p className="text-xs text-slate-400 break-all">Reference {current.reference}</p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the 6-digit code we emailed you. Never tell this code to the agent or anyone else.
            </p>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="------"
              className="text-center text-2xl tracking-[0.5em]"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onCancel} disabled={loading}>
                {isTransfer ? "Reject" : "Cancel"}
              </Button>
              <Button onClick={onConfirm} disabled={loading || code.length !== 6}>
                {loading ? "Checking..." : "Approve"}
              </Button>
            </div>
          </div>
        )}

        {step === "waiting" && current && (
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-1 text-sm">
              <p className="text-slate-500">Collect from the agent</p>
              <p className="text-2xl font-bold">{money(current.amount)}</p>
              <p className="text-slate-500 break-words">Agent: {current.agentName}</p>
              <p className="text-xs text-slate-400 break-all">Reference {current.reference}</p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex gap-2">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" />
              Approved. The agent will give you the cash and confirm it; only then is your wallet debited.
              This request expires at{" "}
              {new Date(current.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button variant="outline" className="w-full" onClick={onCancel} disabled={loading}>
              Cancel cash-out
            </Button>
          </div>
        )}

        {step === "done" && current && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold">
              {isTransfer ? "Transfer sent" : "Cash-out complete"}
            </p>
            <p className="text-sm text-slate-500">
              {money(current.amount)} {isTransfer ? "sent" : "paid out"}. A receipt is on its way to your
              email.
            </p>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}

        {step === "closed" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-500">
              {current ? closedMessage(current.status) : "This request is closed."}
            </p>
            <Button className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Card on the Wallet page ---------------- */

export function AgentRequestsCard({
  maxAmount,
  startSignal,
}: {
  maxAmount: number;
  /** Incremented by the page's "Cash out at agent" button to open a new cash-out. */
  startSignal: number;
}) {
  const [requests, setRequests] = useState<AgentRequest[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [active, setActive] = useState<AgentRequest | null>(null);

  // Ids seen on the last poll. One that drops out has ended (paid out, declined, cancelled
  // or expired), so the wallet balance is reloaded even when the dialog is closed.
  const seen = useRef<Set<number> | null>(null);
  const refresh = useCallback(
    () =>
      listAgentRequests()
        .then((list) => {
          const ids = new Set(list.map((r) => r.id));
          const ended = seen.current ? [...seen.current].some((id) => !ids.has(id)) : false;
          seen.current = ids;
          setRequests(list);
          if (ended) void syncUserProfile();
        })
        .catch(() => undefined),
    [],
  );

  // A transfer an agent starts for this customer must show up without a reload.
  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    if (startSignal > 0) {
      setActive(null);
      setDialogOpen(true);
    }
  }, [startSignal]);

  const open = (r: AgentRequest) => {
    setActive(r);
    setDialogOpen(true);
  };

  const reject = async (r: AgentRequest) => {
    try {
      await cancelAgentRequest(r.id);
      dispatchShowToast({ message: "Request cancelled. Nothing was taken from your wallet.", type: "success" });
    } catch (err) {
      dispatchShowToast({ message: apiError(err)?.message || "Could not cancel.", type: "danger" });
    }
    void refresh();
  };

  return (
    <>
      {requests.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-600" />
              <h2 className="font-semibold">Agent requests</h2>
            </div>
            <ul className="space-y-3">
              {requests.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="text-sm min-w-0">
                    <p className="font-medium break-words">
                      {r.type === "transfer"
                        ? `Send ${money(r.amount)} to ${r.recipient?.fullName || r.recipient?.email}`
                        : `Cash out ${money(r.amount)}`}
                    </p>
                    <p className="text-slate-500 break-words">Agent: {r.agentName}</p>
                    <p className="text-xs text-slate-400">
                      {r.status === "awaiting_agent" ? "Approved — waiting for the agent's cash" : "Waiting for your code"}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => reject(r)}>
                      {r.type === "transfer" ? "Reject" : "Cancel"}
                    </Button>
                    <Button size="sm" onClick={() => open(r)}>
                      {r.status === "awaiting_agent" ? "View" : "Enter code"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <AgentRequestDialog
        open={dialogOpen}
        request={active}
        maxAmount={maxAmount}
        onClose={() => {
          setDialogOpen(false);
          void refresh();
        }}
        onChanged={refresh}
      />
    </>
  );
}
