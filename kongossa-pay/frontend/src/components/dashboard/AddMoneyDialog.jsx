import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Landmark, Smartphone } from 'lucide-react';
// import { Transaction, User } from '@/api/entities';
import { createTransaction } from '@/api/transactions';
import { updateUser } from '@/api/users';

export default function AddMoneyDialog({ isOpen, onClose, onMoneyAdded, user }) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddMoney = async (method) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setIsProcessing(true);
    try {
      // Create a deposit transaction
      await createTransaction({
        sender_id: 'external_source',
        recipient_id: user.id,
        amount: parseFloat(amount),
        currency: user.currency || 'USD',
        type: 'deposit',
        status: 'completed',
        payment_method: method,
        description: `Deposit via ${method.replace('_', ' ')}`,
      });
      
      // Update user's balance
      const newBalance = (user.wallet_balance || 0) + parseFloat(amount);
      await updateUser(user.id, { wallet_balance: newBalance });
      
      onMoneyAdded();
      onClose();
    } catch (error) {
      console.error("Error adding money:", error);
      alert("Failed to add money. Please try again.");
    } finally {
      setIsProcessing(false);
      setAmount('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Money to Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2 mb-6">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg h-12"
            />
          </div>
          <Tabs defaultValue="credit_card" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="credit_card"><CreditCard className="w-4 h-4 mr-2"/>Card</TabsTrigger>
              <TabsTrigger value="bank_transfer"><Landmark className="w-4 h-4 mr-2"/>Bank</TabsTrigger>
              <TabsTrigger value="mobile_money"><Smartphone className="w-4 h-4 mr-2"/>Mobile</TabsTrigger>
            </TabsList>
            <TabsContent value="credit_card" className="pt-4 space-y-4">
                <div>
                    <Label>Card Number</Label>
                    <Input placeholder="**** **** **** 1234"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Expiry Date</Label>
                        <Input placeholder="MM/YY"/>
                    </div>
                    <div>
                        <Label>CVV</Label>
                        <Input placeholder="123"/>
                    </div>
                </div>
              <Button onClick={() => handleAddMoney('card')} className="w-full" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Add $${amount || '0.00'} with Card`}
              </Button>
            </TabsContent>
            <TabsContent value="bank_transfer" className="pt-4 text-center">
              <p className="text-sm text-slate-500 mb-4">
                Bank transfer details would be shown here.
              </p>
              <Button onClick={() => handleAddMoney('bank_transfer')} className="w-full" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Add $${amount || '0.00'} with Bank Transfer`}
              </Button>
            </TabsContent>
            <TabsContent value="mobile_money" className="pt-4 space-y-4">
              <div>
                <Label>Phone Number</Label>
                <Input placeholder="Enter your mobile money number"/>
              </div>
              <Button onClick={() => handleAddMoney('mobile_money')} className="w-full" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : `Add $${amount || '0.00'} with Mobile Money`}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}