import { Breadcrumbs } from '@/components';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Head } from '@inertiajs/react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Download,
  Target,
  TrendingDown,
  TrendingUp,
  Users
} from 'lucide-react';
import { useState } from 'react';

interface AnalyticsData {
  period: string;
  budget_analytics: {
    total_allocated: number;
    total_spent: number;
    savings_rate: number;
    categories: Array<{
      name: string;
      color: string;
      allocated: number;
      spent: number;
      percentage: number;
    }>;
    spending_trend: Array<{
      period: string;
      amount: number;
    }>;
  };
  tontine_analytics: {
    total_contributed: number;
    total_received: number;
    net_flow: number;
    active_tontines: number;
    contribution_rate: number;
    tontines: Array<{
      name: string;
      type: string;
      contributed: number;
      received: number;
      roi: number;
    }>;
  };
  financial_health: {
    score: number;
    grade: string;
    recommendations: string[];
  };
}

interface AnalyticsProps {
  analytics: AnalyticsData;
}

export default function Analytics({ analytics }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(analytics.period);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const url = new URL(window.location.href);
    url.searchParams.set('period', period);
    window.location.href = url.toString();
  };

  const budgetUsagePercentage = analytics.budget_analytics.total_allocated > 0
    ? (analytics.budget_analytics.total_spent / analytics.budget_analytics.total_allocated) * 100
    : 0;

  const netTontineFlow = analytics.tontine_analytics.net_flow;
  const tontineROI = analytics.tontine_analytics.total_contributed > 0
    ? ((analytics.tontine_analytics.total_received - analytics.tontine_analytics.total_contributed) / analytics.tontine_analytics.total_contributed) * 100
    : 0;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics & Reports' },
  ];

  return (
    <>
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <Head title="Aanlysis & Reports" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your financial activities and performance.
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-48">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30_days">Last 30 Days</SelectItem>
                <SelectItem value="3_months">Last 3 Months</SelectItem>
                <SelectItem value="6_months">Last 6 Months</SelectItem>
                <SelectItem value="1_year">Last Year</SelectItem>
                <SelectItem value="all_time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Financial Health Score */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Financial Health Score</CardTitle>
                <CardDescription>
                  Overall assessment of your financial habits and progress
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  {analytics.financial_health.score}/100
                </div>
                <Badge
                  variant="secondary"
                  className={
                    analytics.financial_health.grade === 'A' ? 'bg-green-100 text-green-800' :
                      analytics.financial_health.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        analytics.financial_health.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                  }
                >
                  Grade {analytics.financial_health.grade}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={analytics.financial_health.score} className="mb-4 h-3" />
            <div className="space-y-2">
              <h4 className="font-medium">Recommendations:</h4>
              <ul className="space-y-1">
                {analytics.financial_health.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <ArrowUpRight className="h-3 w-3 mt-0.5 text-blue-500" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${analytics.budget_analytics.total_spent.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {budgetUsagePercentage.toFixed(1)}% of budget used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics.budget_analytics.savings_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Of allocated budget saved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tontine ROI</CardTitle>
              {tontineROI >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${tontineROI >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {tontineROI >= 0 ? '+' : ''}{tontineROI.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Return on investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tontines</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.tontine_analytics.active_tontines}
              </div>
              <p className="text-xs text-muted-foreground">
                Contributing regularly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget and Tontine Analytics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Category Analysis</CardTitle>
              <CardDescription>
                Spending breakdown by budget categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.budget_analytics.categories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.percentage.toFixed(1)}% of budget
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={Math.min((category.spent / category.allocated) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tontine Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Tontine Performance</CardTitle>
              <CardDescription>
                Analysis of your tontine investments and returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Contributed</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${analytics.tontine_analytics.total_contributed.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Received</p>
                    <p className="text-lg font-bold text-green-600">
                      ${analytics.tontine_analytics.total_received.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Net Flow */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Net Flow</span>
                    <div className="flex items-center gap-1">
                      {netTontineFlow >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-bold ${netTontineFlow >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {netTontineFlow >= 0 ? '+' : ''}${netTontineFlow.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Tontines */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Individual Tontines</h4>
                  {analytics.tontine_analytics.tontines.map((tontine, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{tontine.name}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {tontine.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          ${tontine.contributed.toLocaleString()} → ${tontine.received.toLocaleString()}
                        </p>
                        <p className={`text-xs ${tontine.roi >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {tontine.roi >= 0 ? '+' : ''}{tontine.roi.toFixed(1)}% ROI
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>
              Monthly spending patterns and trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.budget_analytics.spending_trend.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Not enough data to show spending trends. Keep tracking your expenses!
                </p>
              ) : (
                <div className="space-y-2">
                  {analytics.budget_analytics.spending_trend.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{
                              width: `${(trend.amount / Math.max(...analytics.budget_analytics.spending_trend.map(t => t.amount))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          ${trend.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
