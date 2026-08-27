import { useState } from "react";
import type { FormEvent } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createPaymentRequest } from "@/modules/pos/api";
import type { PaymentRequest } from "@/modules/pos/api";

const CURRENCIES = ["USD", "EUR", "GBP", "XAF", "XOF", "GHS", "NGN", "ZMW", "CAD"];

export default function CreatePaymentRequestPage() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState<PaymentRequest | null>(null);
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createPaymentRequest(
        amount ? Number(amount) : undefined,
        description || undefined,
        currency,
      );
      setRequest(result);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not create the payment request.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!request) return;
    await navigator.clipboard.writeText(request.paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (request) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-[#0B1226]">Show this to your customer</h1>
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center space-y-4">
          <div className="p-4 bg-white border border-gray-100 rounded-xl">
            <QRCodeSVG value={request.paymentUrl} size={200} />
          </div>
          <p className="text-2xl font-bold text-[#0B1226]">
            {amount ? `$${Number(amount).toFixed(2)}` : "Any amount"}
          </p>
          {description && <p className="text-sm text-gray-500">{description}</p>}
          <button
            onClick={onCopy}
            className="w-full border border-gray-200 text-gray-700 font-medium py-3 rounded-xl"
          >
            {copied ? "Link copied!" : "Copy payment link"}
          </button>
        </div>
        <button
          onClick={() => setRequest(null)}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl"
        >
          New request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Get paid</h1>
      <p className="text-sm text-gray-500">
        Create a payment request -- your customer scans the QR or opens the link to pay from
        their own phone.
      </p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (leave blank for customer to enter)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.5"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="e.g. Groceries"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Creating..." : "Generate QR"}
        </button>
      </form>
    </div>
  );
}
