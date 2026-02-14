import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, BarChart3, TrendingUp, DollarSign } from 'lucide-react';
// These components will be created in the next steps, for now we assume they exist
// import CRMDashboard from '../components/agent_crm/CRMDashboard';
// import AgentList from '../components/agent_crm/AgentList';
// import FloatRequestList from '../components/agent_crm/FloatRequestList';

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
                    <Card className="dark:bg-gray-900 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-100">
                                Coming Soon: Agent KPI Dashboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="dark:text-gray-400">
                            <p>
                                A dashboard with key performance indicators for your agent network will be displayed here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="agents">
                    <Card className="dark:bg-gray-900 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-100">
                                Coming Soon: Agent Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="dark:text-gray-400">
                            <p>
                                A detailed list of all agents, with performance metrics and management actions, will be available here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="float_requests">
                    <Card className="dark:bg-gray-900 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-100">
                                Coming Soon: Float Request Management
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="dark:text-gray-400">
                            <p>
                                A tool to review, approve, and reject agent float requests will be here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="remittances">
                    <Card className="dark:bg-gray-900 dark:border-gray-800">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-100">
                                Coming Soon: Remittance Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="dark:text-gray-400">
                            <p>
                                A complete log of all cash-in and cash-out transactions processed by agents will be shown here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AgentCRM;
