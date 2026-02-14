import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Share, Copy, Download } from 'lucide-react';
// import { QRPayment } from '@/api/entities';
import { createQRPayment } from '@/api/qrPayments';

export default function QRCodeDialog({ isOpen, onClose, user }) {
  const [qrAmount, setQrAmount] = useState('');
  const [qrDescription, setQrDescription] = useState('');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      const qrCode = `PAY_${user.id}_${Date.now()}`;
      const qrPayment = await createQRPayment({
        qr_code: qrCode,
        recipient_id: user.id,
        amount: qrAmount ? parseFloat(qrAmount) : null,
        description: qrDescription || `Payment to ${user.full_name}`,
        payment_type: qrAmount ? 'one_time' : 'open_amount'
      });
      
      setGeneratedQR({
        code: qrCode,
        amount: qrAmount,
        description: qrDescription,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
          type: 'kongossapay_payment',
          recipient: user.id,
          amount: qrAmount || null,
          description: qrDescription || `Payment to ${user.full_name}`,
          qr_code: qrCode
        }))}`
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
    setIsGenerating(false);
  };

  const copyQRCode = () => {
    if (generatedQR) {
      navigator.clipboard.writeText(generatedQR.code);
      alert('QR code copied to clipboard!');
    }
  };

  const shareQRCode = () => {
    if (navigator.share && generatedQR) {
      navigator.share({
        title: 'KongossaPay Payment',
        text: `Pay me using this QR code: ${generatedQR.code}`,
        url: window.location.origin
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Receive Money with QR Code
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate QR</TabsTrigger>
            <TabsTrigger value="scan">Scan QR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            {!generatedQR ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (Optional)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={qrAmount}
                    onChange={(e) => setQrAmount(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Leave empty for flexible amount
                  </p>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Payment for..."
                    value={qrDescription}
                    onChange={(e) => setQrDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={generateQRCode} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <img 
                    src={generatedQR.qrUrl} 
                    alt="Payment QR Code"
                    className="mx-auto"
                  />
                </div>
                <div className="text-sm text-slate-600">
                  <p className="font-semibold">
                    {generatedQR.amount ? `$${generatedQR.amount}` : 'Flexible Amount'}
                  </p>
                  <p>{generatedQR.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyQRCode} className="flex-1">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={shareQRCode} className="flex-1">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setGeneratedQR(null)}
                  className="w-full"
                >
                  Generate New QR
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="scan" className="space-y-4">
            <div className="text-center py-8">
              <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">Scan QR Code</h3>
              <p className="text-slate-500 text-sm mb-4">
                Use your camera to scan a KongossaPay QR code
              </p>
              <Button>Open Camera Scanner</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}