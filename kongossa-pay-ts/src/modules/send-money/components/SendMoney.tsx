import { useEffect, useState } from "react";
import { ArrowLeft, Check, Search, Plus, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useRedux";

import { getOtherUsers } from "@/modules/user/api";
import { getSystemSettings } from "@/modules/fee-management/api";
import { sendMoney } from "@/modules/history/api";
import { getWalletStats } from "@/modules/wallet/api";
import { TopUpDialog } from "@/modules/wallet/components/TopUpDialog";
import { dispatchShowToast, syncCurrentUser } from "@/lib/dispatch";

interface Contact {
  id: number;
  fullName: string;
  email: string;
  profileImage?: string;
}

interface SystemSettings {
  transferFeePercent: number;
}

export default function SendMoney() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState(""); // ✅ Remarks field
  const [searchTerm, setSearchTerm] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [users, fees, wallet] = await Promise.all([
        getOtherUsers(),
        getSystemSettings(),
        getWalletStats(),
      ]);

      setContacts(users);
      setSettings(fees);
      setWalletBalance(wallet.balance ?? user.walletBalance ?? 0);
    };

    load();
  }, [user]);

  /* ---------------- SEARCH USERS ---------------- */
  useEffect(() => {
    if (!user) return;

    const t = setTimeout(async () => {
      const users = await getOtherUsers(searchTerm);
      setContacts(users);
    }, 400);

    return () => clearTimeout(t);
  }, [searchTerm, user]);

  /* ---------------- CALCULATION ---------------- */
  const amountNum = Number(amount || 0);
  const fee = settings ? amountNum * (settings.transferFeePercent / 100) : 0;
  const total = amountNum + fee;
  const remainingBalance = walletBalance - total; // ✅ Wallet after deduction

  const canSend = amountNum > 0 && selectedContact && walletBalance >= total;

  /* ---------------- SEND MONEY ---------------- */
  const handleSendMoney = async () => {
    if (!canSend || !selectedContact) return;

    setIsSending(true);
    try {
      await sendMoney({
        recipientId: selectedContact.id,
        amount: amountNum,
        description: remarks, // ✅ Save remarks in backend
      });

      // 🔄 wait for webhook
      await syncCurrentUser();

      dispatchShowToast({
        type: "success",
        message: "Money sent successfully!",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      });
      setIsSuccess(true);
    } finally {
      setIsSending(false);
    }
  };

  /* ---------------- SUCCESS ---------------- */
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Money Sent!</h2>
          <p className="text-muted-foreground mb-6">
            You sent ${amountNum.toFixed(2)} to {selectedContact?.fullName}
          </p>
          <Button className="w-full" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button variant="success" className="w-full" onClick={() => navigate("/wallet")}>
            Go to Wallet
          </Button>
        </Card>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">Send Money</h1>
        </div>

        {/* Wallet Balance */}
        <Card className="bg-linear-to-r from-slate-900 to-blue-900 text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-blue-200">Available Balance</p>
              <p className="text-2xl font-bold">${walletBalance.toFixed(2)}</p>
            </div>
            <Wallet className="w-8 h-8 opacity-70" />
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="p-4 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Select Person</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 overflow-x-auto">
            {contacts.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedContact(c)}
                className={`p-2 rounded-lg cursor-pointer ${
                  selectedContact?.id === c.id ? "bg-blue-100 text-black" : ""
                }`}
              >
                <Avatar className="w-12 h-12 mx-auto">
                  {c.profileImage ? (
                    <AvatarImage src={`${import.meta.env.VITE_APP_API_URL}${c.profileImage}`} />
                  ) : (
                    <AvatarFallback className="bg-blue-500 text-white">{c.fullName[0]}</AvatarFallback>
                  )}
                </Avatar>
                <p className="text-xs mt-1 text-center">{c.fullName}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Amount */}
        <div>
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="$0.00"
          />
        </div>

        {/* Remarks */}
        <div>
          <Label>Remarks</Label>
          <Textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Write a note or description..."
          />
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount</span>
              <span>${amountNum.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fee</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Wallet After Deduction</span>
              <span>${remainingBalance.toFixed(2)}</span> {/* ✅ Updated live */}
            </div>
          </CardContent>
        </Card>

        {/* Insufficient Balance */}
        {!canSend && amountNum > 0 && (
          <Button variant="outline" className="w-full" onClick={() => setShowTopUp(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Top Up Wallet
          </Button>
        )}

        {/* Send */}
        <Button
          className="w-full h-12"
          disabled={!canSend || isSending}
          onClick={handleSendMoney}
        >
          {isSending ? "Sending..." : "Send Now"}
        </Button>
      </div>

      {/* Top Up */}
      <TopUpDialog
        open={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
