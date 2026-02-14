import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { checkPermissions } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Folder,
    LayoutGrid,
    PlusCircle,
    Receipt,
    Settings,
    Target,
    Users,
    Wallet
} from 'lucide-react';
import { useMemo } from 'react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: 'manage:dashboard',
    },
    {
        title: 'Budget Management',
        href: '#',
        icon: Wallet,
        permission: 'manage:budget',
        items: [
            {
                title: 'My Budgets',
                href: '/budgets',
                icon: Target,
            },
            {
                title: 'Categories',
                href: '/budget-categories',
                icon: Folder,
            },
            {
                title: 'Expenses',
                href: '/expenses',
                icon: Receipt,
            },
            {
                title: 'New Budget',
                href: '/budgets/create',
                icon: PlusCircle,
            },
        ],
    },
    {
        title: 'E-Tontine',
        href: '#',
        icon: Users,
        permission: 'manage:tontine',
        items: [
            {
                title: 'My Tontines',
                href: '/tontines',
                icon: Users,
            },
            // {
            //     title: 'Contributions',
            //     href: '/contributions',
            //     icon: Receipt,
            // },
            {
                title: 'Invitations',
                href: '/invitations',
                icon: BookOpen,
            },
            {
                title: 'Create Tontine',
                href: '/tontines/create',
                icon: PlusCircle,
            },
        ],
    },
    // {
    //     title: 'Analytics',
    //     href: '/analytics',
    //     icon: BarChart3,
    // },
    {
        title: 'Manage Users',
        href: '/users',
        icon: Users,
        permission: 'manage:user'
    },
    {
        title: 'Manage Access',
        href: '/roles',
        icon: Users,
        permission: 'manage:role'
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        permission: 'manage:settings'
    },
];

export function AppSidebar() {
    const { props } = usePage();

    // @ts-ignore
    const authPermissions = props.auth.permissions.map((permission) => permission.name);

    // @ts-ignore
    const menus = useMemo(() => mainNavItems.filter((item) => checkPermissions(item.permission, authPermissions)), [props.auth])

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={menus} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
