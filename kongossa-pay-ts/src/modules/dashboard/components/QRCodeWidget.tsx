import React, { useState, useEffect } from "react";
import { QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQRCode, regenerateQR } from "../api";

interface QRCodeWidgetProps {
  userId: string;
}

const QRCodeWidget: React.FC<QRCodeWidgetProps> = ({ userId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadQRCode = async () => {
    setIsLoading(true);
    try {
      const res = await getQRCode(userId);
      setQrCodeUrl(res);
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
    setIsLoading(false);
  };

  const regenerateQRCode = async () => {
    setIsLoading(true);
    try {
      const res = await regenerateQR(userId);
      setQrCodeUrl(res);
    } catch (error) {
      console.error("Error regenerating QR code:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadQRCode();
  }, []);

  if (!qrCodeUrl) {
    return (
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
        <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 animate-pulse mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading QR...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
      <img
        src={qrCodeUrl}
        alt="User QR Code"
        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain mb-3 sm:mb-4"
      />
      <Button
        onClick={regenerateQRCode}
        className="flex items-center gap-2 text-xs sm:text-sm"
        size="sm"
        disabled={isLoading}
      >
        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
        {isLoading ? "Regenerating..." : "Regenerate QR"}
      </Button>
    </div>
  );
};

export default QRCodeWidget;