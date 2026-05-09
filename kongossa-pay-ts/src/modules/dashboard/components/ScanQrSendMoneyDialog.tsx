import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendMoney } from "@/modules/history/api";
import { getQRUser } from "@/modules/dashboard/api";
import { getSystemSettings } from "@/modules/fee-management/api";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Check } from "lucide-react";
import { getCurrentUser } from "@/modules/auth/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ScanQrSendMoneyModal({ open, onClose }: Props) {
  const [recipient, setRecipient] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [settings, setSettings] = useState<{ transferFeePercent: number } | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isSuccess, setIsSuccess] = useState(false);

  const qrRef = useRef<HTMLDivElement>(null);
  const qrInstance = useRef<Html5Qrcode | null>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const currentUser = await getCurrentUser();
      const [fees] = await Promise.all([getSystemSettings()]);

      setSettings(fees);
      setWalletBalance(currentUser.walletBalance);
    };

    load();
  }, [open]);

  // ---------- START SCANNER ----------
  useEffect(() => {
    if (!open) return;
    if (!qrRef.current) return;
    if (recipient) return;

    let cancelled = false;

    const startScanner = async () => {
      try {
        await new Promise((r) => requestAnimationFrame(r));

        if (!qrRef.current || cancelled) return;

        const scanner = new Html5Qrcode("qr-reader");
        qrInstance.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras.length) {
          console.error("No camera found");
          return;
        }

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            if (!isRunning.current) return;
            isRunning.current = false;

            try {
              await scanner.stop();
              await scanner.clear();

              const res = await getQRUser(decodedText);
              setRecipient(res.user);
            } catch (err) {
              console.error("QR processing failed:", err);
            }
          },
          (errorMessage) => {
            console.log("QR scan frame error:", errorMessage);
          }
        );

        isRunning.current = true;
      } catch (err) {
        console.error("Camera start failed:", err);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (isRunning.current && qrInstance.current) {
        qrInstance.current.stop().catch(() => {});
        qrInstance.current.clear();
      }
      isRunning.current = false;
      qrInstance.current = null;
    };
  }, [open, recipient]);

  // ---------- CLOSE ----------
  const handleClose = async () => {
    if (isRunning.current && qrInstance.current) {
      try {
        await qrInstance.current.stop();
        await qrInstance.current.clear();
      } catch {}
    }

    isRunning.current = false;
    qrInstance.current = null;
    setRecipient(null);
    setAmount("");
    setRemarks("");

    onClose();
  };

  // ---------- SEND MONEY ----------
  const handleSend = async () => {
    if (!canSend) return;

    setIsSending(true);
    try {
      await sendMoney({
        recipientId: recipient.id,
        amount: amountNum,
        description: remarks,
      });

      setIsSuccess(true);
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  const amountNum = Number(amount || 0);
  const fee = settings ? amountNum * (settings.transferFeePercent / 100) : 0;
  const total = amountNum + fee;
  const remainingBalance = walletBalance - total;

  const canSend = recipient && amountNum > 0 && walletBalance >= total && !isSending;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-sm w-full text-center p-4 sm:p-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3 sm:mb-4">
            <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Money Sent!</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
            You sent ${amountNum.toFixed(2)} to {recipient.fullName}
          </p>
          <Button className="w-full" onClick={handleClose}>
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            {recipient ? "Send Money" : "Scan QR Code"}
          </h2>
          <button onClick={handleClose} className="text-xl text-muted-foreground hover:text-foreground">
            &times;
          </button>
        </div>

        {!recipient ? (
          <div
            id="qr-reader"
            ref={qrRef}
            className="w-full h-[260px] rounded bg-gray-100 dark:bg-gray-800"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                {recipient.profileImage ? (
                  <AvatarImage
                    src={`${import.meta.env.VITE_APP_API_URL}${recipient.profileImage}`}
                  />
                ) : (
                  <AvatarFallback className="text-sm sm:text-base">
                    {recipient.fullName?.[0] || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">{recipient.fullName}</p>
                <p className="text-xs text-muted-foreground">QR Recipient</p>
              </div>
            </div>

            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-sm sm:text-base"
            />

            <Textarea
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="text-sm sm:text-base"
            />

            <Card>
              <CardContent className="p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-foreground">${amountNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fee</span>
                  <span className="text-foreground">${fee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold text-sm">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Wallet Balance</span>
                  <span>${walletBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>After Deduction</span>
                  <span className={remainingBalance < 0 ? "text-red-500" : "text-green-500"}>
                    ${remainingBalance.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              disabled={!amount || isSending}
              onClick={handleSend}
            >
              {isSending ? "Sending..." : "Send Money"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}