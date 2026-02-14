import { Breadcrumbs } from '@/components';
import { ExpenseForm } from '@/components/forms';
import { useToast } from '@/hooks/use-toast';
import { BudgetCategory } from '@/types/forms';
import { Head, router } from '@inertiajs/react';


interface CreateExpenseProps {
  budgetCategories: BudgetCategory[];
}

export default function CreateExpense({ budgetCategories }: CreateExpenseProps) {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Expense Added",
      description: "Your expense has been recorded successfully.",
    });
    router.visit('/expenses');
  };

  const handleCancel = () => {
    router.visit('/expenses');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Budget Management' },
    { label: 'Expenses', href: '/expenses' },
    { label: 'Add Expense' },
  ];

  return (
    <>
      <Head title='Add Expense' />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="max-w-2xl mx-auto mt-10">
        <ExpenseForm
          categories={budgetCategories}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
