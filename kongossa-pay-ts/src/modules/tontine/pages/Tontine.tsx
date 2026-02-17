import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Tontine, User } from '@/api/entities';
import { getCurrentUser } from "@/modules/auth/api";
import { getTontines } from "@/modules/tontine/api";
import CreateTontineDialog from '@/modules/tontine/components/CreateTontineDialog';
import TontineCard from '@/modules/tontine/components/TontineCard';
import TontineInvites from '@/modules/tontine/components/TontineInvites';
import TontineStats from '@/modules/tontine/components/TontineStats';
import { useDispatch } from "react-redux";
import { showToast } from "@/redux/slices/toastSlice"; 
import type { User } from '@/modules/auth/types';
import Breadcrumbs from "@/components/module/admin/layout/Breadcrumb";
// import AdminLayout from '@/layouts/AdminLayout';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import { Can } from '@/components/custom/Can';

// -----------------------
// Type Definitions
// -----------------------

interface Tontine {
  id: string;
  name: string;
  [key: string]: any;
}

export default function TontinePage() {
  const [user, setUser] = useState<User | null>(null);
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('my-tontines');
  const dispatch = useDispatch(); 

  useEffect(() => {
    loadTontineData();
  }, []);

  const loadTontineData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
    const userTontines = await getTontines({
      creator_id: currentUser.id,
      sort: '-created_date'
    });
      setTontines(userTontines.data);
    } catch (error) {
      console.error("Error loading tontine data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTontineCreated = () => {
    loadTontineData();
    setShowCreateDialog(false);
    dispatch(
      showToast({
        type: "success",
        message: "Tontine created successfully!",
        position: "top-right",
        animation: "slide-right-in",
        duration: 4000,
      })
    );
  };
  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "E-Tontine" },
    { label: "My Tontines", href: "/tontines" },
  ];


  if (isLoading) {
    return (
      <PageTransition>
      <div className="space-y-6">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="bg-slate-50 min-h-screen p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div className="bg-slate-50 min-h-screen p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white"/>
                  </div>
                  Digital E-Tontine
                </h1>
                <p className="text-slate-500 mt-1">
                  Save together, grow together. Join or create investment circles with your community.
                </p>
              </div>
              <Can anyOf={["create:tontine"]}>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Tontine
                </Button>
              </Can>
            </div>

            {/* Stats Overview */}
            <TontineStats tontines={tontines} />

            {/* Tontine Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-white rounded-xl p-1">
                <TabsTrigger value="my-tontines" className="rounded-lg">My Tontines</TabsTrigger>
                <TabsTrigger value="available" className="rounded-lg">Available</TabsTrigger>
                <TabsTrigger value="invites" className="rounded-lg">Invites</TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
              </TabsList>

              <TabsContent value="my-tontines" className="space-y-6">
                {tontines.length === 0 ? (
                  <Card className="rounded-2xl shadow-sm border-dashed border-2 border-slate-300">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tontines Yet</h3>
                      <p className="text-slate-500 mb-6">
                        Create your first tontine to start saving with friends, family, or colleagues
                      </p>
                      <Can anyOf={["create:tontine"]}>
                        <Button onClick={() => setShowCreateDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Tontine
                        </Button>
                      </Can>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tontines.map((tontine) => (
                      <TontineCard key={tontine.id} tontine={tontine} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="available" className="space-y-6">
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Discover Tontines</h3>
                  <p className="text-slate-500">Find open tontines to join in your community</p>
                </div>
              </TabsContent>

              <TabsContent value="invites" className="space-y-6">
                <TontineInvites />
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">Tontine History</h3>
                  <p className="text-slate-500">Your completed tontines and payouts will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <CreateTontineDialog 
            isOpen={showCreateDialog}
            onClose={() => setShowCreateDialog(false)}
            onTontineCreated={handleTontineCreated}
            user={user}
          />
        </div>
      </div>
    </PageTransition>
  );
}
