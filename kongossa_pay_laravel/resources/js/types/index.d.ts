import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { BudgetCategory } from './forms';

export interface Auth {
    user: User;
}

export interface AuthUser {
    auth: {
        user: User;
        permissions: Permission[]
    }
}

// Define the Role type
interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    total_users?: number
}

export interface Permission {
    id: number;
    name: string;
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    email_verified_at: string | null;
    role: Role;
    status: string;
    user_type?: 'personal' | 'business_merchant';
    // Business fields
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    manager_name?: string;
    company_legal_form?: string;
    legal_form_document?: string;
    legal_form_document_url?: string;
    business_description?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginatedData<T> {
    data: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
}

interface DashboardProps {
    stats: {
        budgets: {
            total: number;
            active: number;
            totalAllocated: number;
            totalSpent: number;
            overBudgetCount: number;
        };
        tontines: {
            total: number;
            active: number;
            totalContributed: number;
            totalReceived: number;
            pendingInvites: number;
        };
        recentExpenses: Array<{
            id: number;
            title: string;
            amount: number;
            category: string;
            date: string;
        }>;
        upcomingPayouts: Array<{
            id: number;
            tontine_name: string;
            amount: number;
            payout_date: string;
        }>;
    };
}

export interface Expense {
    id: number;
    title: string;
    amount: number;
    expense_date: string;
    created_at: string;
    budget_category: BudgetCategory;
}

export interface Budget {
    id: number;
    name: string;
    period: 'weekly' | 'monthly' | 'yearly';
    total_amount: number;
    total_spent: number;
    categories: BudgetCategory[];
    expenses: Expense[];
    created_at: string;
    is_over_budget: boolean;
    usage_percentage: number;
}
