// Main Component Exports
export * from './forms';

// Layout Components
export { DashboardLayout } from '@/layouts/DashboardLayout';

// UI Components
export * from './ui/button';
export * from './ui/card';
export * from './ui/input';
export * from './ui/label';
export * from './ui/select';
export * from './ui/badge';
export * from './ui/progress';
export * from './ui/dialog';
export * from './ui/dropdown-menu';
export * from './ui/table';
export * from './ui/tabs';
export * from './ui/switch';
export * from './ui/popover';
export * from './ui/toast';
export * from './ui/toaster';
export * from './ui/skeleton';

// Custom Components
export { LoadingSpinner, PageLoadingSpinner, CardLoadingSkeleton, TableLoadingSkeleton } from './LoadingSpinner';
export { ConfirmationDialog, useDeleteConfirmation } from './ConfirmationDialog';
export { EmptyState } from './EmptyState';

// App Components
export { AppSidebar } from './app-sidebar';
export { AppHeader } from './app-header';
export { Breadcrumbs } from './breadcrumbs';

// Hooks
export { useForm } from '@/hooks/useForm';
export { useToast, toast } from '@/hooks/use-toast';

// Re-export commonly used icons
export {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  DollarSign,
  Users,
  Calendar,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Settings,
  BarChart3,
  PieChart,
  Crown,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
