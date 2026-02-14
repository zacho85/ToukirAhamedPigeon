import '../css/app.css';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page = (await resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx')
        )) as any;

        if (name.startsWith('auth/') || name === 'welcome' || name === 'invitations/PublicInvitation' || name === 'auth/register') {
            page.default.layout = page.default.layout || ((page: React.ReactNode) => page);
            return page;
        }
        page.default.layout =
            page.default.layout || ((page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>);
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
