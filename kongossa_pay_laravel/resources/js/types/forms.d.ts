// Form Types based on Migration Files

export type PeriodEnum = 'weekly' | 'monthly' | 'yearly';
export type TontineTypeEnum = 'friends' | 'family' | 'savings' | 'investment';
export type FrequencyEnum = 'weekly' | 'monthly';
export type StatusEnum = 'scheduled' | 'completed' | 'pending' | 'accepted' | 'declined' | 'paid' | 'late';

// Budget Forms
export interface BudgetFormData {
  name: string;
  period: PeriodEnum;
  total_amount: number;
}

export interface BudgetCategoryFormData {
  budget_id: number;
  name: string;
  color?: string;
  limit_amount: number;
}

// Expense Forms
export interface ExpenseFormData {
  budget_category_id: number;
  title: string;
  amount: number;
  expense_date: string; // ISO date string
}

// Tontine Forms
export interface TontineFormData {
  name: string;
  type: TontineTypeEnum;
  contribution_amount: number;
  frequency: FrequencyEnum;
  duration_months: number;
}

export interface TontineInviteFormData {
  tontine_id: number;
  email: string;
}

export interface TontineMemberFormData {
  tontine_id: number;
  user_id: number;
  priority_order?: number;
  is_admin?: boolean;
}

export interface TontineContributionFormData {
  tontine_member_id: number;
  amount: number;
  contribution_date: string; // ISO date string
  status?: StatusEnum;
}

// API Response Types
export interface Budget {
  id: number;
  user_id: number;
  name: string;
  period: PeriodEnum;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: number;
  budget_id: number;
  name: string;
  color?: string;
  description: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
  budget?: Budget
}

export interface Expense {
  id: number;
  budget_category_id: number;
  title: string;
  amount: number;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface Tontine {
  id: number;
  created_by: number;
  name: string;
  type: TontineTypeEnum;
  contribution_amount: number;
  frequency: FrequencyEnum;
  duration_months: number;
  created_at: string;
  updated_at: string;
}

export interface TontineInvite {
  id: number;
  tontine_id: number;
  email: string;
  invite_token: string;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
}

export interface TontineMember {
  id: number;
  tontine_id: number;
  user_id: number;
  priority_order?: number;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface TontineContribution {
  id: number;
  tontine_member_id: number;
  amount: number;
  contribution_date: string;
  status: StatusEnum;
  created_at: string;
  updated_at: string;
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | string[];
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  processing: boolean;
  isDirty: boolean;
  hasErrors: boolean;
}

export interface TontineTypeEnums {
  label: string;
  value: TontineTypeEnum;
  description: string
}

interface TontineInvite {
  id: number;
  email: string;
  status: string;
  created_at: string;
  tontine: {
    id: number;
    name: string;
    type: string;
    contribution_amount: number;
    frequency: string;
  };
}