import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { confirmTransfer, lookupUser, transfer } from "@/modules/agents/api";

type Step = "form" | "review" | "otp" | "success";
type Party = { email: string; fullName: string; active: boolean };

const apiError = (err: unknown) =>
  (err as { response?: { data?: { message?: string; code?: string } } })?.response?.data;

export default function TransferPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [sender, setSender] = useState<Party | null>(null);
  const [recipient, setRecipient] = useState<Party | null>(null);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Set when the pending transfer was cancelled or expired.
  const [otpClosed, setOtpClosed] = useState(false);

  const startOver = () => {
    setStep("form");
    setPendingId(null);
    setCode("");
    setError("");
    setOtpClosed(false);
  };

  // Step 1: look both customers up so the agent can check the names.
  const onSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (senderEmail.trim().toLowerCase() === recipientEmail.trim().toLowerCase()) {
      setError("Sender and recipient must be different customers.");
      return;
    }
    setLoading(true);
    try {
      const [from, to] = await Promise.all([lookupUser(senderEmail), lookupUser(recipientEmail)]);
      if (!from.active) throw new Error(`${from.fullName}'s account is not active.`);
      if (!to.active) throw new Error(`${to.fullName}'s account is not active.`);
      setSender(from);
      setRecipient(to);
      setStep("review");
    } catch (err) {
      setError(apiError(err)?.message || (err as Error).message || "Could not find that customer.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: send it. Above the OTP threshold the sender confirms by code.
  const onConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await transfer(senderEmail, recipientEmail, Number(amount), notes || undefined);
      if (result.requiresOtp) {
        setPendingId(result.id);
        setStep("otp");
      } else {
        setStep("success");
      }
    } catch (err) {
      setError(apiError(err)?.message || "Transfer failed.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingId) return;
    setError("");
    setLoading(true);
    try {
      await confirmTransfer(pendingId, code);
      setStep("success");
    } catch (err) {
      const data = apiError(err);
      setError(data?.message || "Invalid or expired code.");
      if (data?.code === "TRANSFER_CANCELLED" || data?.code === "TRANSFER_EXPIRED") {
        setOtpClosed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const money = `$${Number(amount || 0).toFixed(2)}`;

  if (step === "success") {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
          <span className="text-emerald-600 text-2xl">✓</span>
        </div>
        <h1 className="text-lg font-bold text-[#0B1226]">Transfer complete</h1>
        <p className="text-sm text-gray-500">
          {money} sent from {sender?.fullName} to {recipient?.fullName}.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-[#0B1226]">Confirm with the sender</h1>
        <p className="text-sm text-gray-500">
          This amount is above the instant-confirm threshold. Ask {sender?.fullName} for the 6-digit
          code sent to {sender?.email}.
        </p>
        <form onSubmit={onSubmitOtp} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl tracking-[0.5em]"
            placeholder="------"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {otpClosed ? (
            <button
              type="button"
              onClick={startOver}
              className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl"
            >
              Start a new transfer
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
            >
              {loading ? "Confirming..." : "Confirm"}
            </button>
          )}
        </form>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-bold text-[#0B1226]">Check the transfer</h1>
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3 text-sm">
          <div>
            <p className="text-gray-400">From</p>
            <p className="font-semibold text-[#0B1226] break-words">{sender?.fullName}</p>
            <p className="text-gray-500 break-all">{sender?.email}</p>
          </div>
          <div>
            <p className="text-gray-400">To</p>
            <p className="font-semibold text-[#0B1226] break-words">{recipient?.fullName}</p>
            <p className="text-gray-500 break-all">{recipient?.email}</p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <p className="text-gray-400">Amount</p>
            <p className="text-2xl font-bold text-[#0B1226]">{money}</p>
          </div>
          <p className="text-xs text-gray-400">No cash changes hands, and no commission is earned.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="bg-white border border-gray-200 text-[#0B1226] font-medium py-3 rounded-xl"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#0B1226]">Transfer</h1>
      <p className="text-sm text-gray-500">
        Move money from one customer's wallet to another's. No cash changes hands.
      </p>

      <form onSubmit={onSubmitForm} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sender email</label>
          <input
            type="email"
            required
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="sender@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient email</label>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="recipient@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0B1226] text-white font-medium py-3 rounded-xl disabled:opacity-60"
        >
          {loading ? "Checking..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
