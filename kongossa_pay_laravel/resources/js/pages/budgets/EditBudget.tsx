import { Breadcrumbs } from '@/components';
import { BudgetForm } from '@/components/forms';
import { useToast } from '@/hooks/use-toast';
import { Budget } from '@/types';
import { Head, router } from '@inertiajs/react';

interface EditBudgetProps {
  budget: Budget;
}

export default function EditBudget({ budget }: EditBudgetProps) {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Budget Updated",
      description: "Your budget has been updated successfully.",
    });
    router.visit(`/budgets/${budget.id}`);
  };

  const handleCancel = () => {
    router.visit(`/budgets/${budget.id}`);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Budget Management' },
    { label: 'Budgets', href: '/budgets' },
    { label: budget.name, href: `/budgets/${budget.id}` },
    { label: 'Edit' },
  ];

  return (
    <>
      <Head title='`Edit ${budget.name}`' />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="max-w-2xl mx-auto">
        <BudgetForm
          budget={budget}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
