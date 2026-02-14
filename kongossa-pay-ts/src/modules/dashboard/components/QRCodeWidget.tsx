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

  // Fetch existing QR from backend
  const loadQRCode = async () => {
    setIsLoading(true);
    try {
      const res = await getQRCode(userId);
      setQrCodeUrl(res); // backend returns Base64 image URL
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
      <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
        <QrCode className="w-16 h-16 text-gray-400 dark:text-gray-500 animate-pulse mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Loading QR...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow">
      <img
        src={qrCodeUrl}
        alt="User QR Code"
        className="w-48 h-48 object-contain mb-4"
      />
      <Button
        onClick={regenerateQRCode}
        className="flex items-center gap-2"
        size="sm"
        disabled={isLoading}
      >
        <RefreshCw className="w-4 h-4" />
        {isLoading ? "Regenerating..." : "Regenerate QR"}
      </Button>
    </div>
  );
};

export default QRCodeWidget;
