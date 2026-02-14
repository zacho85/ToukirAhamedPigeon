import React, { useState, useEffect } from 'react';
// import { User, Remittance, FloatRequest } from '@/api/entities';
import { getCurrentUser } from '@/api/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Send, Users } from 'lucide-react';

export default function AgentDashboard() {
  const [agent, setAgent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        const currentAgent = await getCurrentUser();
        setAgent(currentAgent);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
      setIsLoading(false);
    };
    fetchAgentData();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading Agent Dashboard...</div>;
  }
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Agent Dashboard</h1>
      <p>Welcome, {agent?.full_name}</p>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Float</CardTitle>
            <DollarSign className="w-5 h-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${(agent?.wallet_balance || 0).toLocaleString()}</p>
            <Button className="mt-4 w-full">Request Float</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>New Remittance</CardTitle>
            <Send className="w-5 h-5 text-slate-500" />
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-600 mb-4">Process a new cash-in or cash-out transaction.</p>
             <Button className="w-full">New Transaction</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Contacts</CardTitle>
            <Users className="w-5 h-5 text-slate-500" />
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-600 mb-4">Manage your frequent senders and recipients.</p>
             <Button className="w-full">Manage Contacts</Button>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader><CardTitle>My Recent Remittances</CardTitle></CardHeader>
          <CardContent><p>A list of your recent transactions will appear here.</p></CardContent>
        </Card>
    </div>
  );
}