
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Trash2, 
  Star, 
  Landmark, // Changed from Bank to Landmark
  Smartphone,
  MoreVertical
} from "lucide-react";
// import { PaymentMethod } from "@/api/entities";
import { deletePaymentMethod } from "@/api/paymentMethod";

const methodIcons = {
  credit_card: CreditCard,
  debit_card: CreditCard,
  bank_account: Landmark, // Changed from Bank to Landmark
  mobile_money: Smartphone,
  paypal: CreditCard
};

const methodColors = {
  credit_card: "from-blue-500 to-blue-600",
  debit_card: "from-green-500 to-green-600", 
  bank_account: "from-purple-500 to-purple-600",
  mobile_money: "from-orange-500 to-orange-600",
  paypal: "from-blue-600 to-purple-600"
};

export default function PaymentMethodCard({ method, onRefresh }) {
  const IconComponent = methodIcons[method.type] || CreditCard;
  const gradientColor = methodColors[method.type] || "from-gray-500 to-gray-600";

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove this payment method?")) {
      try {
        await deletePaymentMethod(method.id);
        onRefresh();
      } catch (error) {
        console.error("Error deleting payment method:", error);
      }
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${gradientColor} rounded-xl flex items-center justify-center`}>
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            {method.is_default && (
              <Badge className="bg-yellow-100 text-yellow-800">
                <Star className="w-3 h-3 mr-1" />
                Default
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">
              {method.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <Badge 
              variant={method.is_verified ? 'default' : 'secondary'}
              className={method.is_verified ? 'bg-green-100 text-green-800' : ''}
            >
              {method.is_verified ? 'Verified' : 'Pending'}
            </Badge>
          </div>

          <p className="text-slate-600">
            {method.bank_name || method.provider || 'Unknown Provider'}
          </p>

          <p className="text-slate-500 text-sm">
            {method.account_name}
          </p>

          <div className="flex items-center justify-between pt-2">
            <p className="text-slate-400 text-sm font-mono">
              ****{method.last_four || '0000'}
            </p>
            {method.expiry_date && (
              <p className="text-slate-400 text-sm">
                {method.expiry_date}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
