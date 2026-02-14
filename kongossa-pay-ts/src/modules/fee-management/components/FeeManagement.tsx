import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Percent, Settings } from "lucide-react";

// ✅ API
import { getSystemSettings, saveSystemSettings } from "@/modules/fee-management/api";
import { dispatchShowToast } from "@/lib/dispatch";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface FeeSettingsState {
  transfer_fee_percent: number;
  withdrawal_fee_flat: number;
  forex_markup_percent: number;
  crypto_markup_percent: number;
  tontine_fee_percent: number;
}

/* ------------------------------------------------------------------ */
/* COMPONENT */
/* ------------------------------------------------------------------ */

export default function AdminFeeManagement() {
  const [settings, setSettings] = useState<FeeSettingsState>({
    transfer_fee_percent: 1.5,
    withdrawal_fee_flat: 2.5,
    forex_markup_percent: 2.0,
    crypto_markup_percent: 2.5,
    tontine_fee_percent: 0.5,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Load latest system settings */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const latest = await getSystemSettings();

      if (latest) {
        setSettings({
          transfer_fee_percent: latest.transferFeePercent,
          withdrawal_fee_flat: latest.withdrawalFeeFlat,
          forex_markup_percent: latest.forexMarkupPercent,
          crypto_markup_percent: latest.cryptoMarkupPercent,
          tontine_fee_percent: latest.tontineFeePercent,
        });
      }
    } catch (err) {
      console.error("Failed to load system settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Save (create new version) */
  /* ------------------------------------------------------------------ */

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSystemSettings({
        transferFeePercent: settings.transfer_fee_percent,
        withdrawalFeeFlat: settings.withdrawal_fee_flat,
        forexMarkupPercent: settings.forex_markup_percent,
        cryptoMarkupPercent: settings.crypto_markup_percent,
        tontineFeePercent: settings.tontine_fee_percent,
      });

      dispatchShowToast({
        message: "Settings saved successfully!",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      });
    } catch (err) {
      console.error("Failed to save settings:", err);
      dispatchShowToast({
        message: "Failed to save settings",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* Input handler */
  /* ------------------------------------------------------------------ */

  const handleInputChange = (
    field: keyof FeeSettingsState,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  /* ------------------------------------------------------------------ */
  /* Loading */
  /* ------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <div className="p-6 text-gray-900 dark:text-gray-100">
        Loading settings...
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Fee Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Configure platform fees and commissions
          </p>
        </div>
      </div>

      {/* Fee Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transfer & Withdrawal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Transfer & Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Money Transfer Fee (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={settings.transfer_fee_percent}
                  onChange={(e) =>
                    handleInputChange(
                      "transfer_fee_percent",
                      e.target.value
                    )
                  }
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              </div>
            </div>

            <div>
              <Label>Withdrawal Fee (Flat)</Label>
              <Input
                type="number"
                step="0.25"
                value={settings.withdrawal_fee_flat}
                onChange={(e) =>
                  handleInputChange(
                    "withdrawal_fee_flat",
                    e.target.value
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Exchange */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-600" />
              Exchange Markups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Forex Markup (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.forex_markup_percent}
                onChange={(e) =>
                  handleInputChange(
                    "forex_markup_percent",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <Label>Crypto Markup (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.crypto_markup_percent}
                onChange={(e) =>
                  handleInputChange(
                    "crypto_markup_percent",
                    e.target.value
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Tontine */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tontine Management Fee (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              step="0.1"
              value={settings.tontine_fee_percent}
              onChange={(e) =>
                handleInputChange(
                  "tontine_fee_percent",
                  e.target.value
                )
              }
            />
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Preview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">$100 Transfer</p>
            <p>
              Fee: $
              {(100 * settings.transfer_fee_percent / 100).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">$1000 Forex</p>
            <p>
              Markup: $
              {(1000 * settings.forex_markup_percent / 100).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">Withdrawal</p>
            <p>Fee: ${settings.withdrawal_fee_flat.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
