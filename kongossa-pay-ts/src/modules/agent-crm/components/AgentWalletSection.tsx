import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { showToast } from "@/redux/slices/toastSlice";
import { adjustWallet, getWalletAdjustments } from "../api";
import type { WalletAdjustment } from "../api";
import { apiErrorMessage, usePermission } from "./usePermission";

/**
 * Admin credit/debit of an agent's wallet balance (not their cash on hand),
 * with a required reason and a confirmation step, plus past adjustments.
 */
export default function AgentWalletSection({
  agentId,
  agentName,
  walletBalance,
  onChanged,
}: {
  agentId: number;
  agentName: string;
  walletBalance: number;
  onChanged: () => void;
}) {
  const dispatch = useDispatch();
  const canEdit = usePermission("update:agent-crm");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  // What the confirmation dialog shows and submits. Kept separate from the
  // form so the dialog text does not change while it animates closed.
  const [review, setReview] = useState({ direction: "credit" as "credit" | "debit", amount: 0, reason: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<WalletAdjustment[]>([]);

  const loadHistory = useCallback(() => {
    getWalletAdjustments(agentId).then(setHistory).catch(() => setHistory([]));
  }, [agentId]);

  useEffect(loadHistory, [loadHistory]);

  const value = Number(amount);
  const valid = value > 0 && reason.trim().length >= 5;

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      await adjustWallet(agentId, review.direction, review.amount, review.reason);
      dispatch(
        showToast({
          type: "success",
          message: `Wallet ${review.direction === "credit" ? "credited" : "debited"} $${review.amount.toFixed(2)}`,
        }),
      );
      setAmount("");
      setReason("");
      setConfirming(false);
      loadHistory();
      onChanged();
    } catch (err) {
      setError(apiErrorMessage(err, "The adjustment failed."));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-3">
        <p className="text-xs text-muted-foreground">Agent wallet balance</p>
        <p className="text-2xl font-bold tabular-nums">${Number(walletBalance).toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">
          Credits and debits change this balance only, never the agent's cash on hand.
        </p>
      </div>

      {canEdit && (
        <div className="border rounded-lg p-3 space-y-3">
          <p className="text-sm font-medium">Credit or debit</p>
          <div className="grid grid-cols-2 gap-2">
            {(["credit", "debit"] as const).map((d) => (
              <Button
                key={d}
                type="button"
                variant={direction === d ? "default" : "outline"}
                onClick={() => setDirection(d)}
              >
                {d === "credit" ? "Credit (+)" : "Debit (−)"}
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <Label htmlFor="adj-amount" className="text-xs">
              Amount
            </Label>
            <Input
              id="adj-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="adj-reason" className="text-xs">
              Reason (required, at least 5 characters)
            </Label>
            <Textarea
              id="adj-reason"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            className="w-full"
            disabled={!valid}
            onClick={() => {
              setReview({ direction, amount: value, reason: reason.trim() });
              setConfirming(true);
            }}
          >
            Review {direction}
          </Button>
        </div>
      )}

      <div>
        <p className="text-sm font-medium mb-2">Past adjustments</p>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">None yet.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="border rounded-md p-2 text-xs space-y-0.5">
                <div className="flex justify-between gap-2">
                  <span className={h.direction === "credit" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {h.direction === "credit" ? "+" : "−"}${Number(h.amount).toFixed(2)}
                  </span>
                  <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString()}</span>
                </div>
                <p className="break-words">{h.reason}</p>
                <p className="text-muted-foreground">
                  {h.admin?.fullName ?? "Admin"} · ${h.balanceBefore.toFixed(2)} → ${h.balanceAfter.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={confirming} onOpenChange={(v) => !saving && setConfirming(v)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm {review.direction}</DialogTitle>
            <DialogDescription>
              {review.direction === "credit"
                ? `$${review.amount.toFixed(2)} will be added to ${agentName}'s wallet.`
                : `$${review.amount.toFixed(2)} will be taken from ${agentName}'s wallet.`}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm break-words">
            <span className="text-muted-foreground">Reason: </span>
            {review.reason}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={saving} onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant={review.direction === "debit" ? "destructive" : "default"}
              disabled={saving}
              onClick={submit}
            >
              {saving ? "Saving..." : `Confirm ${review.direction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
