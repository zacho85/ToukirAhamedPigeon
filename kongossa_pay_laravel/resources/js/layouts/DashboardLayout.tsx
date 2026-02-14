import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { UniversalLoader } from '@/components/UniversalLoader';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, WhenVisible } from '@inertiajs/react';
import { motion } from 'framer-motion';
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function DashboardLayout({ children, title = 'Dashboard', breadcrumbs }: DashboardLayoutProps) {
  const { url } = usePage();
  return (
    <>
      <WhenVisible data="permissions" fallback={() => <UniversalLoader />}>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-background">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* <AppHeader /> */}
              <main className="flex-1 overflow-auto">
                <div className="container mx-auto px-4 py-6 space-y-6">
                  {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
                  <motion.div
                    key={url}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className='flex-1'
                  >
                    {children}
                  </motion.div>
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </SidebarProvider>
      </WhenVisible>
    </>
  );
}
