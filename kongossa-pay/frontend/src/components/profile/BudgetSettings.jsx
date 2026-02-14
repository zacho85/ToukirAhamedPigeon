import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
// import { User } from "@/api/entities";
import { updateUser } from "@/api/users";
import { Calendar, DollarSign, TrendingUp, Target } from "lucide-react";

export default function BudgetSettings({ user, onUpdate }) {
  const [budgets, setBudgets] = useState({
    weekly: user?.weekly_budget || 0,
    monthly: user?.monthly_budget || 0,
    yearly: user?.yearly_budget || 0
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBudgetChange = (period, value) => {
    setBudgets(prev => ({
      ...prev,
      [period]: parseFloat(value) || 0
    }));
  };

  const saveBudgets = async () => {
    setIsUpdating(true);
    try {
      await updateUser(user.id, {
        weekly_budget: budgets.weekly,
        monthly_budget: budgets.monthly,
        yearly_budget: budgets.yearly
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating budgets:", error);
    }
    setIsUpdating(false);
  };

  // Mock spending data - in real app this would come from transactions
  const spendingData = {
    weekly: { spent: 250, budget: budgets.weekly || 500 },
    monthly: { spent: 1200, budget: budgets.monthly || 2000 },
    yearly: { spent: 8500, budget: budgets.yearly || 25000 }
  };

  const BudgetCard = ({ period, icon, title, spent, budget, color }) => {
    const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    const remaining = Math.max(budget - spent, 0);
    
    return (
      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-sm text-slate-500">${spent} of ${budget}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">${remaining}</p>
              <p className="text-sm text-slate-500">remaining</p>
            </div>
          </div>
          
          <Progress value={percentage} className="mb-3" />
          
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{percentage.toFixed(1)}% used</span>
            <span className={percentage > 90 ? 'text-red-600' : percentage > 70 ? 'text-amber-600' : 'text-green-600'}>
              {percentage > 90 ? 'Over budget!' : percentage > 70 ? 'Close to limit' : 'On track'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <BudgetCard
          period="weekly"
          icon={<Calendar className="w-5 h-5 text-blue-600" />}
          title="Weekly Budget"
          spent={spendingData.weekly.spent}
          budget={spendingData.weekly.budget}
          color="bg-blue-100"
        />
        <BudgetCard
          period="monthly"
          icon={<Target className="w-5 h-5 text-green-600" />}
          title="Monthly Budget"
          spent={spendingData.monthly.spent}
          budget={spendingData.monthly.budget}
          color="bg-green-100"
        />
        <BudgetCard
          period="yearly"
          icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
          title="Yearly Budget"
          spent={spendingData.yearly.spent}
          budget={spendingData.yearly.budget}
          color="bg-purple-100"
        />
      </div>

      {/* Budget Settings */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Update Budget Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <Label htmlFor="weekly-budget">Weekly Budget</Label>
              <Input
                id="weekly-budget"
                type="number"
                placeholder="0.00"
                value={budgets.weekly || ''}
                onChange={(e) => handleBudgetChange('weekly', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="monthly-budget">Monthly Budget</Label>
              <Input
                id="monthly-budget"
                type="number"
                placeholder="0.00"
                value={budgets.monthly || ''}
                onChange={(e) => handleBudgetChange('monthly', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="yearly-budget">Yearly Budget</Label>
              <Input
                id="yearly-budget"
                type="number"
                placeholder="0.00"
                value={budgets.yearly || ''}
                onChange={(e) => handleBudgetChange('yearly', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            onClick={saveBudgets} 
            className="w-full md:w-auto"
            disabled={isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Save Budget Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}