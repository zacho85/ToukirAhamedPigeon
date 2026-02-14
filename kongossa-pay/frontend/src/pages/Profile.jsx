import React, { useState, useEffect } from "react";
// import { User, Transaction } from "@/api/entities";
import { getCurrentUser } from "@/api/auth";
import { getTransactions } from "@/api/transactions";

import { 
  User as UserIcon, 
  Phone, 
  Mail, 
  MapPin,
  Edit,
  Shield,
  History,
  CreditCard,
  Settings,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

import ProfileEdit from "../components/profile/ProfileEdit";
import TransactionHistory from "../components/profile/TransactionHistory";
import BudgetSettings from "../components/profile/BudgetSettings";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const userTransactions = await getTransactions('-created_date', 50);
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <img 
                  src={user?.profile_image || `https://avatar.vercel.sh/${user?.email}.png`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full"
                />
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                  user?.kyc_status === 'verified' ? 'bg-green-500' : 'bg-amber-500'
                }`}>
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900">
                  {user?.full_name || 'User'}
                </h1>
                <p className="text-slate-500">{user?.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                  <Badge variant={user?.kyc_status === 'verified' ? 'default' : 'secondary'}>
                    {user?.kyc_status === 'verified' ? '✓ Verified' : 'Pending Verification'}
                  </Badge>
                  <Badge variant="outline">
                    {user?.account_type?.charAt(0).toUpperCase() + user?.account_type?.slice(1) || 'Personal'}
                  </Badge>
                  {user?.phone_verified && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Phone Verified
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  ${(user?.wallet_balance || 0).toLocaleString()}
                </p>
                <p className="text-slate-500 text-sm">Current Balance</p>
                <p className="text-lg font-semibold text-amber-600 mt-1">
                  {user?.rewards_points || 0} Points
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl p-1">
            <TabsTrigger value="profile" className="rounded-lg">
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="budget" className="rounded-lg">
              <CreditCard className="w-4 h-4 mr-2" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileEdit user={user} onUpdate={loadProfileData} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <TransactionHistory transactions={transactions} />
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <BudgetSettings user={user} onUpdate={loadProfileData} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium">Phone Verification</p>
                      <p className="text-sm text-slate-500">{user?.phone_number || 'Not provided'}</p>
                    </div>
                  </div>
                  <Badge variant={user?.phone_verified ? 'default' : 'secondary'}>
                    {user?.phone_verified ? 'Verified' : 'Verify'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-slate-500">Transaction alerts and updates</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}