import { Breadcrumbs } from '@/components';
import { TontineForm } from '@/components/forms';
import { useToast } from '@/hooks/use-toast';
import { TontineTypeEnums } from '@/types/forms';
import { Head, router } from '@inertiajs/react';

export default function CreateTontine({ tontineTypes }: { tontineTypes: TontineTypeEnums[] }) {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Tontine Created",
      description: "Your new tontine has been created successfully. You can now invite members.",
    });
    router.visit('/tontines');
  };

  const handleCancel = () => {
    router.visit('/tontines');
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tontine System' },
    { label: 'My Tontines', href: '/tontines' },
    { label: 'Create Tontine' },
  ];

  return (
    <>
      <Head title="Create Tontine" />
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <div className="max-w-3xl mx-auto mt-10">
        <TontineForm
          tontineTypes={tontineTypes}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
