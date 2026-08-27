import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import AgentCrmDashboard from './AgentCrmDashboard';
import AgentsList from './AgentsList';
import FloatRequestsList from './FloatRequestsList';

const AgentCRM: React.FC = () => {
    return (
        <div className="p-6 space-y-6 bg-white text-slate-900 dark:bg-gray-950 dark:text-gray-100">
            <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-100">
                        Agent Network CRM
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400">
                        Manage, monitor, and grow your agent network.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-gray-900">
                    <TabsTrigger value="dashboard" className="dark:data-[state=active]:bg-gray-800 cursor-pointer">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="agents" className="dark:data-[state=active]:bg-gray-800 cursor-pointer">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Agents
                    </TabsTrigger>
                    <TabsTrigger value="float_requests" className="dark:data-[state=active]:bg-gray-800 cursor-pointer">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Float Requests
                    </TabsTrigger>
                    <TabsTrigger value="remittances" className="dark:data-[state=active]:bg-gray-800 cursor-pointer">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Remittances
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                    <AgentCrmDashboard />
                </TabsContent>

                <TabsContent value="agents">
                    <AgentsList />
                </TabsContent>

                <TabsContent value="float_requests">
                    <FloatRequestsList />
                </TabsContent>

                <TabsContent value="remittances">
                    <Card className="dark:bg-gray-900 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-100">
                                Per-agent transaction history
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="dark:text-gray-400">
                            <p>
                                Cash-in/cash-out transactions and day settlements are shown per agent --
                                open an agent from the Agents tab to see their recent activity and
                                reconciliation history.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AgentCRM;
