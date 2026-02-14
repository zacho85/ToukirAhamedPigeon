
import React, { useState, useEffect } from "react";
// import { User, PaymentMethod } from "@/api/entities";
import { getCurrentUser } from "@/api/auth";
import { getPaymentMethods, createPaymentMethod } from "@/api/paymentMethod";
import { updateUser } from "@/api/users";

import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Shield, 
  Star,
  Landmark, // Changed from Bank to Landmark
  Smartphone,
  Wallet as WalletIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import PaymentMethodCard from "../components/wallet/PaymentMethodCard";
import AddPaymentMethodForm from "../components/wallet/AddPaymentMethodForm";
import WalletBalance from "../components/wallet/WalletBalance";

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddMethod, setShowAddMethod] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const userPaymentMethods = await getPaymentMethods(
        { user_id: currentUser.id },
        '-created_date'
      );
      setPaymentMethods(userPaymentMethods);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    }
    setIsLoading(false);
  };

  const handleAddPaymentMethod = async (methodData) => {
    try {
      await createPaymentMethod({
        ...methodData,
        user_id: user.id
      });
      loadWalletData();
      setShowAddMethod(false);
    } catch (error) {
      console.error("Error adding payment method:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-40 bg-gray-200 rounded-xl"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Wallet</h1>
          <p className="text-slate-500 mt-1">
            Manage your balance and payment methods
          </p>
        </div>
        
        <Button 
          onClick={() => setShowAddMethod(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {/* Wallet Balance */}
      <WalletBalance user={user} />

      {/* Payment Methods Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Payment Methods</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {paymentMethods.length} method{paymentMethods.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {paymentMethods.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Payment Methods</h3>
              <p className="text-slate-500 mb-6">
                Add your first payment method to start sending and receiving money
              </p>
              <Button onClick={() => setShowAddMethod(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paymentMethods.map((method) => (
              <PaymentMethodCard 
                key={method.id} 
                method={method}
                onRefresh={loadWalletData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Security Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Secure & Protected</h3>
              <p className="text-green-700 text-sm">
                Your payment information is encrypted and protected with bank-level security. 
                We never store your full card details and use secure tokenization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddMethod} onOpenChange={setShowAddMethod}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <AddPaymentMethodForm 
            onSubmit={handleAddPaymentMethod}
            onCancel={() => setShowAddMethod(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
