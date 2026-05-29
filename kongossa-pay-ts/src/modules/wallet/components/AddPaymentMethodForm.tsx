import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Smartphone, Phone } from "lucide-react";
import { attachPaymentMethod, createSetupIntent, addMomoWallet, addOrangeWallet, addTransfiWallet } from "../api";
import { dispatchShowToast } from "@/lib/dispatch";

const ORANGE_MONEY_COUNTRIES = [
  { code: "ML", label: "Mali (XOF)" },
  { code: "CM", label: "Cameroon (XAF)" },
  { code: "CI", label: "Côte d'Ivoire (XOF)" },
  { code: "SN", label: "Senegal (XOF)" },
  { code: "MG", label: "Madagascar (MGA)" },
  { code: "BW", label: "Botswana (BWP)" },
  { code: "GN", label: "Guinea Conakry (GNF)" },
  { code: "GW", label: "Guinea Bissau (XOF)" },
  { code: "SL", label: "Sierra Leone (SLL)" },
  { code: "CD", label: "DR Congo (CDF)" },
  { code: "CF", label: "Central African Republic (XAF)" },
  { code: "LR", label: "Liberia (LRD)" },
];

const COUNTRY_CURRENCIES = [
  { code: "GH", label: "Ghana (GHS)" },
  { code: "UG", label: "Uganda (UGX)" },
  { code: "RW", label: "Rwanda (RWF)" },
  { code: "ZM", label: "Zambia (ZMW)" },
  { code: "MW", label: "Malawi (MWK)" },
  { code: "CI", label: "Côte d'Ivoire (XOF)" },
  { code: "BJ", label: "Benin (XOF)" },
  { code: "SN", label: "Senegal (XOF)" },
  { code: "CM", label: "Cameroon (XAF)" },
  { code: "CG", label: "Congo (XAF)" },
  { code: "GA", label: "Gabon (XAF)" },
  { code: "TZ", label: "Tanzania (TZS)" },
  { code: "SZ", label: "Eswatini (SZL)" },
  { code: "LR", label: "Liberia (LRD)" },
  { code: "GN", label: "Guinea (GNF)" },
  { code: "CD", label: "DR Congo (CDF)" },
  { code: "NG", label: "Nigeria (NGN)" },
];

export default function AddPaymentMethodForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<"stripe" | "mtn_momo" | "orange_money" | "transfi_zamtel">("stripe");
  const [meta, setMeta] = useState({
    accountName: "",
    bankName: "",
  });

  // MoMo fields
  const [momoName, setMomoName] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoCountry, setMomoCountry] = useState("GH");

  // Orange Money fields
  const [orangeName, setOrangeName] = useState("");
  const [orangePhone, setOrangePhone] = useState("");
  const [orangeCountry, setOrangeCountry] = useState("CI");

  // Transfi fields
  const [transfiName, setTransfiName] = useState("");
  const [transfiPhone, setTransfiPhone] = useState("");

  const saveCard = async () => {
    if (!stripe || !elements) {
      dispatchShowToast({
        type: "danger",
        message: "Stripe not initialized. Please refresh the page.",
      });
      return;
    }

    setLoading(true);
    try {
      const { clientSecret } = await createSetupIntent();
      
      if (!clientSecret) {
        throw new Error("Failed to create setup intent");
      }

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: meta.accountName || undefined,
          },
        },
      });

      if (result.error) {
        console.error("Setup confirmation error:", result.error);
        dispatchShowToast({
          type: "danger",
          message: result.error.message || "Failed to save card",
        });
        return;
      }

      if (!result.setupIntent?.payment_method) {
        throw new Error("Payment method not created");
      }

      const paymentMethodId = result.setupIntent.payment_method as string;

      await attachPaymentMethod(paymentMethodId, {
        accountName: meta.accountName,
        bankName: meta.bankName,
      });

      dispatchShowToast({
        type: "success",
        message: "Card saved successfully!",
      });
      
      onSuccess?.();
    } catch (err: any) {
      console.error("Save card error:", err);
      dispatchShowToast({
        type: "danger",
        message: err.message || "Failed to save card. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrange = async () => {
    if (!orangeName || !orangePhone) {
      dispatchShowToast({
        type: "danger",
        message: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      await addOrangeWallet({
        accountName: orangeName,
        phoneNumber: orangePhone,
        countryCode: orangeCountry,
      });

      dispatchShowToast({
        type: "success",
        message: "Orange Money wallet saved successfully!",
      });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save Orange Money wallet",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMomo = async () => {
    if (!momoName || !momoPhone) {
      dispatchShowToast({
        type: "danger",
        message: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      await addMomoWallet({
        accountName: momoName,
        phoneNumber: momoPhone,
        countryCode: momoCountry,
      });

      dispatchShowToast({
        type: "success",
        message: "MoMo wallet saved successfully!",
      });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save MoMo wallet",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransfi = async () => {
    if (!transfiName || !transfiPhone) {
      dispatchShowToast({
        type: "danger",
        message: "Please fill in all fields",
      });
      return;
    }

    setLoading(true);
    try {
      await addTransfiWallet({
        accountName: transfiName,
        phoneNumber: transfiPhone,
        countryCode: "ZM",
      });

      dispatchShowToast({
        type: "success",
        message: "Zamtel wallet saved successfully!",
      });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save Zamtel wallet",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={provider}
        onValueChange={(v) => setProvider(v as "stripe" | "mtn_momo" | "orange_money" | "transfi_zamtel")}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stripe">
            <CreditCard className="w-4 h-4 mr-2" />
            Card
          </TabsTrigger>
          <TabsTrigger value="mtn_momo">
            <Smartphone className="w-4 h-4 mr-2" />
            MTN MoMo
          </TabsTrigger>
          <TabsTrigger value="orange_money">
            <Phone className="w-4 h-4 mr-2" />
            Orange
          </TabsTrigger>
          <TabsTrigger value="transfi_zamtel">
            <Smartphone className="w-4 h-4 mr-2" />
            Zamtel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="space-y-4 pt-4">
          <Input
            placeholder="Card Holder Name"
            value={meta.accountName}
            onChange={(e) => setMeta({ ...meta, accountName: e.target.value })}
            required
          />
          <Input
            placeholder="Bank Name (optional)"
            value={meta.bankName}
            onChange={(e) => setMeta({ ...meta, bankName: e.target.value })}
          />
          <div className="border rounded-md p-3 bg-background">
            <CardElement
              options={{
                hidePostalCode: true,
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#32325d",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                },
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCard}
              disabled={!stripe || loading}
              className="flex-1 bg-linear-to-r from-blue-600 to-purple-600 order-1 sm:order-2"
            >
              {loading ? "Saving..." : "Save Card"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="orange_money" className="space-y-4 pt-4">
          <div>
            <Label>Account Name</Label>
            <Input
              placeholder="John Doe"
              value={orangeName}
              onChange={(e) => setOrangeName(e.target.value)}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              placeholder="+225 01 00 000 000"
              value={orangePhone}
              onChange={(e) => setOrangePhone(e.target.value)}
            />
          </div>

          <div>
            <Label>Country</Label>
            <select
              value={orangeCountry}
              onChange={(e) => setOrangeCountry(e.target.value)}
              className="w-full border rounded-md p-2 bg-background dark:bg-gray-800"
            >
              {ORANGE_MONEY_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddOrange}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-orange-500 to-red-500 order-1 sm:order-2"
            >
              {loading ? "Saving..." : "Save Orange Money"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="mtn_momo" className="space-y-4 pt-4">
          <div>
            <Label>Account Name</Label>
            <Input
              placeholder="John Doe"
              value={momoName}
              onChange={(e) => setMomoName(e.target.value)}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              placeholder="+233 24 000 0000"
              value={momoPhone}
              onChange={(e) => setMomoPhone(e.target.value)}
            />
          </div>

          <div>
            <Label>Country</Label>
            <select
              value={momoCountry}
              onChange={(e) => setMomoCountry(e.target.value)}
              className="w-full border rounded-md p-2 bg-background dark:bg-gray-800"
            >
              {COUNTRY_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMomo}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-green-500 to-teal-500 order-1 sm:order-2"
            >
              {loading ? "Saving..." : "Save MoMo Wallet"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="transfi_zamtel" className="space-y-4 pt-4">
          <div>
            <Label>Account Name</Label>
            <Input
              placeholder="John Doe"
              value={transfiName}
              onChange={(e) => setTransfiName(e.target.value)}
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              placeholder="+260 97 1234567"
              value={transfiPhone}
              onChange={(e) => setTransfiPhone(e.target.value)}
            />
          </div>

          <div>
            <Label>Country</Label>
            <select
              value="ZM"
              disabled
              className="w-full border rounded-md p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            >
              <option value="ZM">Zambia (ZMW)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransfi}
              disabled={loading}
              className="flex-1 bg-linear-to-r from-blue-600 to-teal-600 order-1 sm:order-2"
            >
              {loading ? "Saving..." : "Save Zamtel Wallet"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}