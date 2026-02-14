import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, BarChart3, TrendingUp, DollarSign, ListTodo } from 'lucide-react';
// These components will be created in the next steps, for now we assume they exist
// import CRMDashboard from '../components/agent_crm/CRMDashboard';
// import AgentList from '../components/agent_crm/AgentList';
// import FloatRequestList from '../components/agent_crm/FloatRequestList';

export default function AgentCRM() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Agent Network CRM</h1>
                    <p className="text-slate-600">Manage, monitor, and grow your agent network.</p>
                </div>
            </div>

            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-2" />Dashboard</TabsTrigger>
                    <TabsTrigger value="agents"><Briefcase className="w-4 h-4 mr-2" />Agents</TabsTrigger>
                    <TabsTrigger value="float_requests"><DollarSign className="w-4 h-4 mr-2" />Float Requests</TabsTrigger>
                    <TabsTrigger value="remittances"><TrendingUp className="w-4 h-4 mr-2" />Remittances</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard">
                    <Card>
                        <CardHeader><CardTitle>Coming Soon: Agent KPI Dashboard</CardTitle></CardHeader>
                        <CardContent><p>A dashboard with key performance indicators for your agent network will be displayed here.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="agents">
                     <Card>
                        <CardHeader><CardTitle>Coming Soon: Agent Management</CardTitle></CardHeader>
                        <CardContent><p>A detailed list of all agents, with performance metrics and management actions, will be available here.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="float_requests">
                     <Card>
                        <CardHeader><CardTitle>Coming Soon: Float Request Management</CardTitle></CardHeader>
                        <CardContent><p>A tool to review, approve, and reject agent float requests will be here.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="remittances">
                     <Card>
                        <CardHeader><CardTitle>Coming Soon: Remittance Log</CardTitle></CardHeader>
                        <CardContent><p>A complete log of all cash-in and cash-out transactions processed by agents will be shown here.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}