import React, { useState, useEffect } from 'react';
// import { User, Remittance, FloatRequest } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Send, Users } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';

export default function AgentDashboard(): React.ReactElement {
  const [agent, setAgent] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAgentData = async (): Promise<void> => {
      try {
        const currentAgent = useAppSelector((state) => state.auth.user);
        setAgent(currentAgent);
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
      setIsLoading(false);
    };
    fetchAgentData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 text-gray-900 dark:text-gray-100">
        Loading Agent Dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold">Agent Dashboard</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Welcome, {agent?.full_name}
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-gray-100">Your Float</CardTitle>
            <DollarSign className="w-5 h-5 text-slate-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold dark:text-gray-100">
              ${(agent?.wallet_balance || 0).toLocaleString()}
            </p>
            <Button className="mt-4 w-full dark:bg-gray-800 dark:hover:bg-gray-700">
              Request Float
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-gray-100">New Remittance</CardTitle>
            <Send className="w-5 h-5 text-slate-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-600 dark:text-gray-400 mb-8">
               Process a new cash-in or cash-out transaction.
             </p>
             <Button className="w-full dark:bg-gray-800 dark:hover:bg-gray-700">
               New Transaction
             </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="dark:text-gray-100">My Contacts</CardTitle>
            <Users className="w-5 h-5 text-slate-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-600 dark:text-gray-400 mb-8">
               Manage your frequent senders and recipients.
             </p>
             <Button className="w-full dark:bg-gray-800 dark:hover:bg-gray-700">
               Manage Contacts
             </Button>
          </CardContent>
        </Card>
      </div>

       <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">
              My Recent Remittances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-400">
              A list of your recent transactions will appear here.
            </p>
          </CardContent>
        </Card>
    </div>
  );
}
