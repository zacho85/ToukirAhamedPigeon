// import AdminLayout from "@/layouts/AdminLayout";
// import Breadcrumb from '@/components/module/admin/layout/Breadcrumb'
// import Dashboard from './../components/Dashboard';
import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import SendMoney from '../components/SendMoney';

export default function SendMoneyPage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.send_money.title"
            defaultTitle="Send Money"
            showTitle={true}
            items={[
                { label: "Send Money", href: "/send-money" },
            ]}
            className='pb-0'
          />
          <SendMoney />
        </div>
      </PageTransition>
  );
}
