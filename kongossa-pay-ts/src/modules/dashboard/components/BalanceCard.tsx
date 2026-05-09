import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { DashboardUser } from "../types";
import { useTranslations } from "@/hooks/useTranslations";

interface Props {
  user: DashboardUser | null;
  onAddMoney: () => void;
}

const BalanceCard: React.FC<Props> = ({ user, onAddMoney }) => {
  const { t } = useTranslations();

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 text-white rounded-2xl h-full">
      <CardContent className="p-4 sm:p-6 flex flex-col justify-center w-full">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs sm:text-sm text-slate-400">
              {t("dashboard.your_balance", "Your Balance")}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
              ${(user?.walletBalance ?? 0).toFixed(2)}
            </h2>
          </div>

          <div className="text-right">
            <p className="text-xs sm:text-sm text-slate-400">
              {t("dashboard.rewards", "Rewards")}
            </p>
            <p className="text-base sm:text-xl font-bold text-amber-400">
              {user?.rewardsPoints ?? 0}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 sm:mt-6">
          <span className="text-xs text-slate-400">**** **** **** 1234</span>
          <Button size="sm" onClick={onAddMoney} className="text-xs sm:text-sm">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            {t("dashboard.add_money", "Add Money")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;