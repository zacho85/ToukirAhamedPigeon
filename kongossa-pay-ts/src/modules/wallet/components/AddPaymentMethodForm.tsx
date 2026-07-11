// src/modules/wallet/components/AddPaymentMethodForm.tsx
import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  attachPaymentMethod,
  createSetupIntent,
  addMomoWallet,
  addOrangeWallet,
  addTransfiWallet,
  addMpesaWallet,
  addPaystackWallet,
  addFlutterwaveWallet,
  addAirtelMoneyWallet,
} from "../api";
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

const MPESA_COUNTRIES = [
  { code: "KE", label: "Kenya (KES)" },
  { code: "TZ", label: "Tanzania (TZS)" },
  { code: "UG", label: "Uganda (UGX)" },
  { code: "RW", label: "Rwanda (RWF)" },
  { code: "CD", label: "DR Congo (CDF)" },
  { code: "ZM", label: "Zambia (ZMW)" },
];

const AIRTEL_COUNTRIES = [
  { code: "UG", label: "Uganda (UGX)" },
  { code: "TZ", label: "Tanzania (TZS)" },
  { code: "KE", label: "Kenya (KES)" },
  { code: "RW", label: "Rwanda (RWF)" },
  { code: "ZM", label: "Zambia (ZMW)" },
  { code: "MW", label: "Malawi (MWK)" },
  { code: "GH", label: "Ghana (GHS)" },
  { code: "NG", label: "Nigeria (NGN)" },
];

const cardElementStyle = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1a202c",
      "::placeholder": { color: "#a0aec0" },
      iconColor: "#4a5568",
    },
    invalid: { color: "#e53e3e", iconColor: "#e53e3e" },
  },
};

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
  const [provider, setProvider] = useState<
    | "stripe"
    | "mtn_momo"
    | "orange_money"
    | "transfi_zamtel"
    | "mpesa"
    | "airtel_money"
    | "paystack"
    | "flutterwave"
  >("stripe");

  const [cardHolderName, setCardHolderName] = useState("");
  const [bankName, setBankName] = useState("");

  // MoMo
  const [momoName, setMomoName] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [momoCountry, setMomoCountry] = useState("GH");

  // Orange
  const [orangeName, setOrangeName] = useState("");
  const [orangePhone, setOrangePhone] = useState("");
  const [orangeCountry, setOrangeCountry] = useState("CI");

  // Transfi
  const [transfiName, setTransfiName] = useState("");
  const [transfiPhone, setTransfiPhone] = useState("");

  // M-Pesa
  const [mpesaName, setMpesaName] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaCountry, setMpesaCountry] = useState("KE");

  // Airtel
  const [airtelName, setAirtelName] = useState("");
  const [airtelPhone, setAirtelPhone] = useState("");
  const [airtelCountry, setAirtelCountry] = useState("UG");

  // Paystack
  const [paystackEmail, setPaystackEmail] = useState("");
  const [paystackCountry, setPaystackCountry] = useState("NG");

  // Flutterwave
  const [flutterwaveEmail, setFlutterwaveEmail] = useState("");
  const [flutterwaveCountry, setFlutterwaveCountry] = useState("NG");

  // ---- Handlers ----
  const saveCard = async () => {
    if (!stripe || !elements) {
      dispatchShowToast({ type: "danger", message: "Stripe not initialized." });
      return;
    }
    if (!cardHolderName.trim()) {
      dispatchShowToast({ type: "danger", message: "Enter cardholder name." });
      return;
    }
    setLoading(true);
    try {
      const { clientSecret } = await createSetupIntent();
      if (!clientSecret) throw new Error("Failed to create setup intent");

      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: { name: cardHolderName },
        },
      });

      if (result.error) throw new Error(result.error.message);
      if (!result.setupIntent?.payment_method) throw new Error("Payment method not created");

      await attachPaymentMethod(result.setupIntent.payment_method as string, {
        accountName: cardHolderName,
        bankName: bankName || undefined,
      });

      dispatchShowToast({ type: "success", message: "Card saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({ type: "danger", message: err.message || "Failed to save card." });
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrange = async () => {
    if (!orangeName || !orangePhone) {
      dispatchShowToast({ type: "danger", message: "Fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await addOrangeWallet({
        accountName: orangeName,
        phoneNumber: orangePhone,
        countryCode: orangeCountry,
      });
      dispatchShowToast({ type: "success", message: "Orange Money saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMomo = async () => {
    if (!momoName || !momoPhone) {
      dispatchShowToast({ type: "danger", message: "Fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await addMomoWallet({
        accountName: momoName,
        phoneNumber: momoPhone,
        countryCode: momoCountry,
      });
      dispatchShowToast({ type: "success", message: "MoMo saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransfi = async () => {
    if (!transfiName || !transfiPhone) {
      dispatchShowToast({ type: "danger", message: "Fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await addTransfiWallet({
        accountName: transfiName,
        phoneNumber: transfiPhone,
        countryCode: "ZM",
      });
      dispatchShowToast({ type: "success", message: "Zamtel saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMpesa = async () => {
    if (!mpesaName || !mpesaPhone) {
      dispatchShowToast({ type: "danger", message: "Fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await addMpesaWallet({
        accountName: mpesaName,
        phoneNumber: mpesaPhone,
        countryCode: mpesaCountry,
      });
      dispatchShowToast({ type: "success", message: "M-Pesa saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAirtel = async () => {
    if (!airtelName || !airtelPhone) {
      dispatchShowToast({ type: "danger", message: "Fill all fields." });
      return;
    }
    setLoading(true);
    try {
      await addAirtelMoneyWallet({
        accountName: airtelName,
        phoneNumber: airtelPhone,
        countryCode: airtelCountry,
      });
      dispatchShowToast({ type: "success", message: "Airtel Money saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaystack = async () => {
    if (!paystackEmail) {
      dispatchShowToast({ type: "danger", message: "Enter email address." });
      return;
    }
    setLoading(true);
    try {
      await addPaystackWallet({
        accountName: paystackEmail,
        countryCode: paystackCountry,
      });
      dispatchShowToast({ type: "success", message: "Paystack wallet saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlutterwave = async () => {
    if (!flutterwaveEmail) {
      dispatchShowToast({ type: "danger", message: "Enter email address." });
      return;
    }
    setLoading(true);
    try {
      await addFlutterwaveWallet({
        accountName: flutterwaveEmail,
        countryCode: flutterwaveCountry,
      });
      dispatchShowToast({ type: "success", message: "Flutterwave wallet saved!" });
      onSuccess?.();
    } catch (err: any) {
      dispatchShowToast({
        type: "danger",
        message: err.response?.data?.message || "Failed to save.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- Render ----
  return (
    <div className="space-y-4">
      <Tabs
        value={provider}
        onValueChange={(v) =>
          setProvider(
            v as
              | "stripe"
              | "mtn_momo"
              | "orange_money"
              | "transfi_zamtel"
              | "mpesa"
              | "airtel_money"
              | "paystack"
              | "flutterwave"
          )
        }
      >
        {/* Tabs List - 2 rows on mobile, 1 row on desktop */}
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 gap-0.5 sm:gap-0">
          <TabsTrigger value="stripe" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            Card
          </TabsTrigger>
          <TabsTrigger value="mtn_momo" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            MTN
          </TabsTrigger>
          <TabsTrigger value="orange_money" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            Orange
          </TabsTrigger>
          <TabsTrigger value="transfi_zamtel" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            Zamtel
          </TabsTrigger>
          <TabsTrigger value="mpesa" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            M‑Pesa
          </TabsTrigger>
          <TabsTrigger value="airtel_money" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            Airtel
          </TabsTrigger>
          <TabsTrigger value="paystack" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            Paystack
          </TabsTrigger>
          <TabsTrigger value="flutterwave" className="text-[10px] sm:text-xs px-0.5 sm:px-1 py-1 sm:py-1.5 cursor-pointer">
            Flutter
          </TabsTrigger>
        </TabsList>

        {/* Fixed height container - ALL tabs content have the same height */}
        <div className="min-h-[420px] sm:min-h-[380px]">
          
          {/* ====== CARD TAB ====== */}
          <TabsContent value="stripe" className="h-full space-y-4 pt-4">
            <div>
              <Label htmlFor="cardHolderName">Cardholder Name</Label>
              <Input
                id="cardHolderName"
                placeholder="John Doe"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="border rounded-md p-3 bg-background focus-within:ring-2 focus-within:ring-blue-500">
                <CardNumberElement options={cardElementStyle} id="cardNumber" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <div className="border rounded-md p-3 bg-background focus-within:ring-2 focus-within:ring-blue-500">
                  <CardExpiryElement options={cardElementStyle} id="cardExpiry" />
                </div>
              </div>
              <div>
                <Label htmlFor="cardCvc">CVC</Label>
                <div className="border rounded-md p-3 bg-background focus-within:ring-2 focus-within:ring-blue-500">
                  <CardCvcElement options={cardElementStyle} id="cardCvc" />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="bankName">Bank Name (optional)</Label>
              <Input
                id="bankName"
                placeholder="Bank of America"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
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

          {/* ====== ORANGE TAB ====== */}
          <TabsContent value="orange_money" className="h-full space-y-4 pt-4">
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
            {/* Empty spacer to match card tab height */}
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
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

          {/* ====== MTN TAB ====== */}
          <TabsContent value="mtn_momo" className="h-full space-y-4 pt-4">
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
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
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

          {/* ====== ZAMTEL TAB ====== */}
          <TabsContent value="transfi_zamtel" className="h-full space-y-4 pt-4">
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
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
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

          {/* ====== M-PESA TAB ====== */}
          <TabsContent value="mpesa" className="h-full space-y-4 pt-4">
            <div>
              <Label>Account Name</Label>
              <Input
                placeholder="John Doe"
                value={mpesaName}
                onChange={(e) => setMpesaName(e.target.value)}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+254 7XX 123456"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Country</Label>
              <select
                value={mpesaCountry}
                onChange={(e) => setMpesaCountry(e.target.value)}
                className="w-full border rounded-md p-2 bg-background dark:bg-gray-800"
              >
                {MPESA_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddMpesa}
                disabled={loading}
                className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 order-1 sm:order-2"
              >
                {loading ? "Saving..." : "Save M-Pesa Wallet"}
              </Button>
            </div>
          </TabsContent>

          {/* ====== AIRTEL TAB ====== */}
          <TabsContent value="airtel_money" className="h-full space-y-4 pt-4">
            <div>
              <Label>Account Name</Label>
              <Input
                placeholder="John Doe"
                value={airtelName}
                onChange={(e) => setAirtelName(e.target.value)}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                placeholder="+256 7XX 123456"
                value={airtelPhone}
                onChange={(e) => setAirtelPhone(e.target.value)}
              />
            </div>
            <div>
              <Label>Country</Label>
              <select
                value={airtelCountry}
                onChange={(e) => setAirtelCountry(e.target.value)}
                className="w-full border rounded-md p-2 bg-background dark:bg-gray-800"
              >
                {AIRTEL_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddAirtel}
                disabled={loading}
                className="flex-1 bg-linear-to-r from-red-600 to-orange-600 order-1 sm:order-2"
              >
                {loading ? "Saving..." : "Save Airtel Money"}
              </Button>
            </div>
          </TabsContent>

          {/* ====== PAYSTACK TAB ====== */}
          <TabsContent value="paystack" className="h-full space-y-4 pt-4">
            <div>
              <Label>Email Address</Label>
              <Input
                placeholder="customer@example.com"
                value={paystackEmail}
                onChange={(e) => setPaystackEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Country (optional)</Label>
              <Input
                placeholder="NG"
                value={paystackCountry}
                onChange={(e) => setPaystackCountry(e.target.value)}
              />
            </div>
            <div className="h-[72px] sm:h-[52px]" />
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddPaystack}
                disabled={loading}
                className="flex-1 bg-blue-600 order-1 sm:order-2"
              >
                {loading ? "Saving..." : "Save Paystack"}
              </Button>
            </div>
          </TabsContent>

          {/* ====== FLUTTERWAVE TAB ====== */}
          <TabsContent value="flutterwave" className="h-full space-y-4 pt-4">
            <div>
              <Label>Email Address</Label>
              <Input
                placeholder="customer@example.com"
                value={flutterwaveEmail}
                onChange={(e) => setFlutterwaveEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Country (optional)</Label>
              <Input
                placeholder="NG"
                value={flutterwaveCountry}
                onChange={(e) => setFlutterwaveCountry(e.target.value)}
              />
            </div>
            <div className="h-[72px] sm:h-[52px]" />
            <div className="h-[72px] sm:h-[52px]" />
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button variant="outline" onClick={onCancel} className="flex-1 order-2 sm:order-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddFlutterwave}
                disabled={loading}
                className="flex-1 bg-purple-600 order-1 sm:order-2"
              >
                {loading ? "Saving..." : "Save Flutterwave"}
              </Button>
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}