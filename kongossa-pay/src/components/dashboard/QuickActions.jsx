import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Receipt, QrCode, CreditCard, History, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const quickActions = [
  {
    title: "Send Money",
    description: "Transfer funds instantly",
    icon: Send,
    url: createPageUrl("SendMoney"),
    color: "from-blue-500 to-purple-600"
  },
  {
    title: "Request Money", 
    description: "Request payment from others",
    icon: Receipt,
    url: createPageUrl("RequestMoney"),
    color: "from-green-500 to-teal-600"
  },
  {
    title: "QR Payment",
    description: "Pay with QR code",
    icon: QrCode,
    url: createPageUrl("QRPayment"),
    color: "from-orange-500 to-red-600"
  },
  {
    title: "Add Card",
    description: "Link payment method",
    icon: CreditCard,
    url: createPageUrl("PaymentMethods"),
    color: "from-purple-500 to-pink-600"
  }
];

export default function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.url}>
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                <p className="text-slate-500 text-sm">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}