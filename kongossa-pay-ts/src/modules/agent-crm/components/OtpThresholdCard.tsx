import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/redux/slices/toastSlice";
import { getOtpThreshold, updateOtpThreshold } from "../api";
import type { OtpThreshold } from "../api";
import { apiErrorMessage, usePermission } from "./usePermission";

const SOURCE_LABEL: Record<OtpThreshold["source"], string> = {
  admin: "set by an admin",
  env: "server default (environment)",
  default: "built-in default",
};

/** The global amount above which cash-outs and transfers need the customer's OTP. */
export default function OtpThresholdCard() {
  const dispatch = useDispatch();
  const canEdit = usePermission("update:agent-crm");
  const [current, setCurrent] = useState<OtpThreshold | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOtpThreshold()
      .then((t) => {
        setCurrent(t);
        setValue(String(t.value));
      })
      .catch(() => setCurrent(null));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const t = await updateOtpThreshold(Number(value));
      setCurrent(t);
      dispatch(showToast({ type: "success", message: "Cash-out OTP threshold updated" }));
    } catch (err) {
      dispatch(showToast({ type: "danger", message: apiErrorMessage(err, "Could not save.") }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm">Customer OTP threshold</CardTitle>
        <p className="text-xs text-muted-foreground">
          Cash-outs and transfers above this amount need a code from the customer. At or below it
          they complete straight away.
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-2">
        <p className="text-2xl font-bold tabular-nums">
          {current ? `$${current.value.toFixed(2)}` : "--"}
          {current && (
            <span className="text-xs font-normal text-muted-foreground ml-2">{SOURCE_LABEL[current.source]}</span>
          )}
        </p>
        {canEdit && (
          <div className="flex gap-2 max-w-sm">
            <Input type="number" step="0.01" min="0.01" value={value} onChange={(e) => setValue(e.target.value)} />
            <Button disabled={saving || !(Number(value) > 0)} onClick={save}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
