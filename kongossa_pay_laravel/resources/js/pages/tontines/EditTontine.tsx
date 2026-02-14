import { Breadcrumbs } from '@/components';
import { TontineForm } from '@/components/forms';
import { useToast } from '@/hooks/use-toast';
import { Tontine, TontineTypeEnums } from '@/types/forms';
import { Head, router } from '@inertiajs/react';

interface EditTontineProps {
  tontine: Tontine;
  tontineTypes: TontineTypeEnums[];
}

export default function EditTontine({ tontine, tontineTypes }: EditTontineProps) {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Tontine Updated",
      description: "Your tontine has been updated successfully.",
    });
    router.visit(`/tontines/${tontine.id}`);
  };

  const handleCancel = () => {
    router.visit(`/tontines/${tontine.id}`);
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Tontine System' },
    { label: 'My Tontines', href: '/tontines' },
    { label: tontine.name, href: `/tontines/${tontine.id}` },
    { label: 'Edit' },
  ];

  return (
    <>
      {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}
      <Head title={`Edit ${tontine.name}`} />
      <div className="max-w-3xl mx-auto mt-10">
        <TontineForm
          tontine={tontine}
          tontineTypes={tontineTypes}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </>
  );
}
