import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowDownLeft, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";

type QuickAction = {
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  url?: string;
  action?: () => void;
  bgColor: string;
  textColor: string;
  disabled?: boolean;
};

interface QuickActionsGridProps {
  onShowQR: () => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onShowQR }) => {

  const quickActions: QuickAction[] = [
    {
      key: "send",
      title: "Send Money",
      description: "Transfer funds",
      icon: Send,
      url: "/send-money",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      key: "receive",
      title: "Receive Money",
      description: "Request payment",
      icon: ArrowDownLeft,
      action: onShowQR,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      key: "deposit",
      title: "Deposit",
      description: "Add funds",
      icon: Plus,
      url: "/wallet",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
    {
      key: "withdraw",
      title: "Withdraw",
      description: "Cash out",
      icon: Minus,
      url: "/withdraw",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
  ];

  const handleClick = useCallback(
    (action?: () => void, disabled?: boolean) => {
      if (disabled || !action) return;
      action();
    },
    []
  );

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 mb-4 dark:text-slate-100">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map(
          ({ key, icon: Icon, disabled, ...action }) => {
            const Wrapper = action.url ? Link : "button";

            return (
              <Wrapper
                key={key}
                to={action.url as never}
                onClick={() => handleClick(action.action, disabled)}
                className={clsx(
                  "focus:outline-none",
                  disabled && "pointer-events-none opacity-60"
                )}
              >
                <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-2xl cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div
                      className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
                        action.bgColor,
                        "group-hover:scale-110 transition-transform duration-200"
                      )}
                    >
                      <Icon className={clsx("w-6 h-6", action.textColor)} />
                    </div>

                    <h3 className="font-semibold text-slate-900 mb-1 text-sm dark:text-slate-100">
                      {action.title}
                    </h3>
                    <p className="text-slate-500 text-xs dark:text-slate-400">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Wrapper>
            );
          }
        )}
      </div>
    </section>
  );
};

export default QuickActionsGrid;
