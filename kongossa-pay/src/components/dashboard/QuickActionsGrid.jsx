
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowDownLeft, Plus, Minus, QrCode, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from '@/components/common/LanguageProvider';

export default function QuickActionsGrid({ onShowQR }) {
  const { t } = useTranslation();

  const quickActions = [
    {
      title: t('dashboard.send_money'),
      description: "Transfer funds",
      icon: Send,
      url: createPageUrl("SendMoney"),
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: t('dashboard.receive_money'),
      description: "Request payment",
      icon: ArrowDownLeft,
      action: onShowQR,
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: t('dashboard.deposit'),
      description: "Add funds",
      icon: Plus,
      url: createPageUrl("Wallet"),
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: t('dashboard.withdraw'),
      description: "Cash out",
      icon: Minus,
      url: createPageUrl("Withdraw"),
      bgColor: "bg-orange-100",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('dashboard.quick_actions')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const ActionWrapper = action.url ? Link : 'div';
          const wrapperProps = action.url ? { to: action.url } : { onClick: action.action };
          
          return (
            <ActionWrapper key={index} {...wrapperProps}>
              <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${action.bgColor} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className={`w-6 h-6 ${action.textColor}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1 text-sm">{action.title}</h3>
                  <p className="text-slate-500 text-xs">{action.description}</p>
                </CardContent>
              </Card>
            </ActionWrapper>
          );
        })}
      </div>
    </div>
  );
}
