import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { sendMoney } from "@/modules/history/api";
import { getQRUser } from "@/modules/dashboard/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ScanQrSendMoneyDialog({ open, onClose }: Props) {
  const [recipient, setRecipient] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSending, setIsSending] = useState(false);

  const qrRef = useRef<HTMLDivElement | null>(null);
  const qrInstance = useRef<Html5Qrcode | null>(null);
  const scannerStarted = useRef(false);

  // ----------- INIT SCANNER -----------
  useEffect(() => {
    if (!open || recipient || !qrRef.current || scannerStarted.current) return;

    const html5QrCode = new Html5Qrcode(qrRef.current.id);
    qrInstance.current = html5QrCode;
    scannerStarted.current = true;

    const startScanner = async () => {
      try {
        // Check if camera is accessible
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          console.error("No camera found");
          return;
        }

        // Start scanning
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            await html5QrCode.stop();
            await html5QrCode.clear();

            const { data } = await getQRUser(decodedText);
            setRecipient(data);
          },
          (errorMessage) => {
            console.log("QR scan frame error:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Camera failed to start:", err);
      }
    };

    // Delay start slightly to ensure DOM is fully mounted
    const id = setTimeout(() => startScanner(), 200);

    return () => {
      clearTimeout(id);
      scannerStarted.current = false;
      qrInstance.current?.stop().catch(() => {});
      qrInstance.current?.clear();
      qrInstance.current = null;
    };
  }, [open, recipient]);

  // ----------- SEND MONEY -----------
  const handleSend = async () => {
    if (!recipient) return;

    setIsSending(true);
    await sendMoney({
      recipientId: recipient.id,
      amount: Number(amount),
      description: remarks,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{recipient ? "Send Money" : "Scan QR Code"}</DialogTitle>
        </DialogHeader>

        {!recipient ? (
          <div ref={qrRef} id="qr-reader" className="w-full min-h-[260px]" />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                {recipient.profileImage ? (
                  <AvatarImage
                    src={`${import.meta.env.VITE_APP_API_URL}${recipient.profileImage}`}
                  />
                ) : (
                  <AvatarFallback>{recipient.fullName[0]}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold">{recipient.fullName}</p>
                <p className="text-xs text-muted-foreground">QR Recipient</p>
              </div>
            </div>

            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <Textarea
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />

            <Button
              className="w-full"
              disabled={!amount || isSending}
              onClick={handleSend}
            >
              {isSending ? "Sending..." : "Send Money"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
