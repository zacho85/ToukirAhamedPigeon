import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Percent, Settings, Landmark } from "lucide-react";

// ✅ API
import { getSystemSettings, saveSystemSettings, getPlatformAccount } from "@/modules/fee-management/api";
import { dispatchShowToast } from "@/lib/dispatch";
import { Can } from "@/components/custom/Can";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface FeeSettingsState {
  transfer_fee_percent: number;
  withdrawal_fee_flat: number;
  forex_markup_percent: number;
  crypto_markup_percent: number;
  tontine_fee_percent: number;
  deposit_fee_percent: number;
  withdrawal_fee_percent: number;
  p2p_fee_percent: number;
  p2p_free_daily_amount: number;
  mobile_money_fee_percent: number;
}

/** The platform fees charged on agent and customer payments. */
const PLATFORM_FEES: {
  field: keyof FeeSettingsState;
  label: string;
  hint: string;
  step: string;
  percent: boolean;
}[] = [
  { field: "deposit_fee_percent", label: "Deposit fee (%)", hint: "Cash in at an agent. Taken from the amount credited.", step: "0.1", percent: true },
  { field: "withdrawal_fee_percent", label: "Withdrawal fee (%)", hint: "Cash out at an agent. Paid on top by the customer.", step: "0.1", percent: true },
  { field: "p2p_fee_percent", label: "Transfer fee (%)", hint: "Between KongossaPay users (Send Money and agent transfers), on the part above the free amount. Paid on top by the sender.", step: "0.1", percent: true },
  { field: "p2p_free_daily_amount", label: "Free transfers per day", hint: "Amount each sender can transfer free per day, in the wallet currency.", step: "1", percent: false },
  { field: "mobile_money_fee_percent", label: "Mobile Money fee (%)", hint: "Sending to a Mobile Money network. Applies once that option is available.", step: "0.1", percent: true },
];

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
    deposit_fee_percent: 0,
    withdrawal_fee_percent: 0.5,
    p2p_fee_percent: 0.5,
    p2p_free_daily_amount: 13,
    mobile_money_fee_percent: 1.5,
  });
  const [platformBalance, setPlatformBalance] = useState<number | null>(null);

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
          deposit_fee_percent: latest.depositFeePercent ?? 0,
          withdrawal_fee_percent: latest.withdrawalFeePercent ?? 0.5,
          p2p_fee_percent: latest.p2pFeePercent ?? 0.5,
          p2p_free_daily_amount: latest.p2pFreeDailyAmount ?? 13,
          mobile_money_fee_percent: latest.mobileMoneyFeePercent ?? 1.5,
        });
      }
      getPlatformAccount()
        .then((a) => setPlatformBalance(a.balance))
        .catch(() => setPlatformBalance(null));
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
        depositFeePercent: settings.deposit_fee_percent,
        withdrawalFeePercent: settings.withdrawal_fee_percent,
        p2pFeePercent: settings.p2p_fee_percent,
        p2pFreeDailyAmount: settings.p2p_free_daily_amount,
        mobileMoneyFeePercent: settings.mobile_money_fee_percent,
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

      {/* Platform fees */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600" />
            Platform fees
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Fees go to the platform account, and agent commission is paid from it.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {PLATFORM_FEES.map((f) => (
              <div key={f.field}>
                <Label htmlFor={f.field}>{f.label}</Label>
                <div className="relative">
                  <Input
                    id={f.field}
                    type="number"
                    min="0"
                    step={f.step}
                    value={settings[f.field]}
                    onChange={(e) => handleInputChange(f.field, e.target.value)}
                  />
                  {f.percent && (
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{f.hint}</p>
              </div>
            ))}
          </div>
          {platformBalance !== null && (
            <div className="p-3 bg-muted rounded-lg flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium">Platform account balance</span>
              <span
                className={`text-lg font-semibold tabular-nums ${
                  platformBalance < 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                }`}
              >
                {platformBalance < 0 ? "−" : ""}${Math.abs(platformBalance).toFixed(2)}
              </span>
              <span className="basis-full text-xs text-slate-500 dark:text-slate-400">
                Fees collected minus agent commission paid. It can go below zero, because cash in pays
                commission without a fee.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Label>QR Payment Fee (%)</Label>
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
            <p className="font-medium">$100 transfer (first of the day)</p>
            <p>
              Fee: $
              {(
                (Math.max(0, 100 - settings.p2p_free_daily_amount) * settings.p2p_fee_percent) /
                100
              ).toFixed(2)}
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
            <p className="font-medium">$100 cash out</p>
            <p>Fee: ${((100 * settings.withdrawal_fee_percent) / 100).toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <Can allOf={["update:fee-management"]}>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Can>
    </div>
  );
}
