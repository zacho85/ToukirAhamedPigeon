import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/redux/slices/toastSlice";
import { updateLimits } from "../api";
import type { AgentLimits } from "../api";
import { apiErrorMessage, usePermission } from "./usePermission";

const FIELDS: { key: keyof AgentLimits; label: string }[] = [
  { key: "maxTransactionAmount", label: "Max per transaction" },
  { key: "dailyTransactionLimit", label: "Daily limit" },
  { key: "monthlyTransactionLimit", label: "Monthly limit" },
  { key: "maxCashOnHand", label: "Max cash on hand" },
];

/** An agent's four transaction limits. Read-only without update:agent-crm. */
export default function AgentLimitsSection({
  agentId,
  limits,
  onSaved,
}: {
  agentId: number;
  limits: AgentLimits;
  onSaved: () => void;
}) {
  const dispatch = useDispatch();
  const canEdit = usePermission("update:agent-crm");
  const [values, setValues] = useState<Record<keyof AgentLimits, string>>(() => toStrings(limits));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setValues(toStrings(limits)), [limits]);

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await updateLimits(agentId, {
        maxTransactionAmount: Number(values.maxTransactionAmount),
        dailyTransactionLimit: Number(values.dailyTransactionLimit),
        monthlyTransactionLimit: Number(values.monthlyTransactionLimit),
        maxCashOnHand: Number(values.maxCashOnHand),
      });
      dispatch(showToast({ type: "success", message: "Limits updated" }));
      if (res.warning) dispatch(showToast({ type: "warning", message: res.warning }));
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save the limits."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-3">
      <div>
        <p className="text-sm font-medium">Limits</p>
        <p className="text-xs text-muted-foreground">
          Max per transaction must not exceed the daily limit, and daily must not exceed monthly.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label htmlFor={`limit-${f.key}`} className="text-xs">
              {f.label}
            </Label>
            <Input
              id={`limit-${f.key}`}
              type="number"
              step="0.01"
              min="0.01"
              disabled={!canEdit}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {canEdit && (
        <Button className="w-full" disabled={saving} onClick={save}>
          {saving ? "Saving..." : "Save limits"}
        </Button>
      )}
    </div>
  );
}

function toStrings(l: AgentLimits): Record<keyof AgentLimits, string> {
  return {
    maxTransactionAmount: String(Number(l.maxTransactionAmount)),
    dailyTransactionLimit: String(Number(l.dailyTransactionLimit)),
    monthlyTransactionLimit: String(Number(l.monthlyTransactionLimit)),
    maxCashOnHand: String(Number(l.maxCashOnHand)),
  };
}
