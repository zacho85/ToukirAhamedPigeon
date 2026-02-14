import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { url } = usePage();
    return (
        <AppShell variant='sidebar'>
            <AppSidebar />
            <AppContent variant='sidebar' className='overflow-x-hidden'>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
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
            </AppContent>
        </AppShell>
    );
}
