// import AdminLayout from "@/layouts/AdminLayout";
// import Breadcrumb from '@/components/module/admin/layout/Breadcrumb'
// import Dashboard from './../components/Dashboard';
import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import FeeManagement from '../components/FeeManagement';

export default function FeeManagementPage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.fee_management.title"
            defaultTitle="Fee Management"
            showTitle={true}
            items={[
                { label: "Fee Management", href: "/fee-management" },
            ]}
            className='pb-0'
          />
          <FeeManagement />
        </div>
      </PageTransition>
  );
}
