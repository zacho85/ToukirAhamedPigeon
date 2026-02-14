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
    <Card className="bg-linear-gradient(to-br, from-slate-800 to-slate-900) text-white rounded-2xl h-full flex">
        <CardContent className="py-14 flex flex-col justify-center w-full">
            <div className="flex justify-between">
            <div>
                <p className="text-sm text-slate-400">
                {t("dashboard.your_balance", "Your Balance")}
                </p>
                <h2 className="text-3xl font-bold">
                ${(user?.wallet_balance ?? 0).toFixed(2)}
                </h2>
            </div>

            <div className="text-right">
                <p className="text-sm text-slate-400">
                {t("dashboard.rewards", "Rewards")}
                </p>
                <p className="text-xl font-bold text-amber-400">
                {user?.rewards_points ?? 0}
                </p>
            </div>
            </div>

            <div className="flex justify-between items-center mt-6">
            <span className="text-xs text-slate-400">**** **** **** 1234</span>
            <Button size="sm" onClick={onAddMoney}>
                <Plus className="w-4 h-4 mr-2" />
                {t("dashboard.add_money", "Add Money")}
            </Button>
            </div>
        </CardContent>
    </Card>
  );
};

export default BalanceCard;
