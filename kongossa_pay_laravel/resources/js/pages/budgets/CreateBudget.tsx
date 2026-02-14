import { Breadcrumbs } from '@/components';
import { BudgetForm } from '@/components/forms';
import { useToast } from '@/hooks/use-toast';
import { Head, router } from '@inertiajs/react';

export default function CreateBudget() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Budget Created",
      description: "Your new budget has been created successfully.",
    });
    router.visit('/budgets');
  };

  const handleCancel = () => {
    router.visit('/budgets');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Budget Management' },
    { label: 'Budgets', href: '/budgets' },
    { label: 'Create Budget' },
  ];

  return (
    <>
      <Head title='Create Budget' />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="max-w-2xl mx-auto mt-10">
        <BudgetForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
