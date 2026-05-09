import React, { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Send, ArrowDownLeft, Plus, Minus, Link as LinkIcon } from "lucide-react";
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
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "receive",
      title: "Receive Money",
      description: "Request payment",
      icon: ArrowDownLeft,
      action: onShowQR,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      key: "payment-link",
      title: "Payment Link",
      description: "Create payment link",
      icon: LinkIcon,
      url: "/payment-links/create",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      key: "deposit",
      title: "Deposit",
      description: "Add funds",
      icon: Plus,
      url: "/wallet",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
    },
    {
      key: "withdraw",
      title: "Withdraw",
      description: "Cash out",
      icon: Minus,
      url: "/withdraw",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      textColor: "text-orange-600 dark:text-orange-400",
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
      <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {quickActions.map(({ key, icon: Icon, disabled, ...action }) => {
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
              <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 rounded-xl sm:rounded-2xl cursor-pointer">
                <CardContent className="p-3 sm:p-4 md:p-6 text-center">
                  <div
                    className={clsx(
                      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3",
                      action.bgColor,
                      "group-hover:scale-110 transition-transform duration-200"
                    )}
                  >
                    <Icon className={clsx("w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6", action.textColor)} />
                  </div>

                  <h3 className="font-semibold text-foreground mb-0.5 text-xs sm:text-sm">
                    {action.title}
                  </h3>
                  <p className="text-muted-foreground text-[10px] sm:text-xs hidden sm:block">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActionsGrid;