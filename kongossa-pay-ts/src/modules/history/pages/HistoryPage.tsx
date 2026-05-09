import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import History from '@/modules/history/components/History';

export default function HistoryPage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-3 sm:gap-4'>
        <Breadcrumb
            title="common.history.title"
            defaultTitle="History"
            showTitle={true}
            items={[
                { label: "History", href: "/history" },
            ]}
            className='pb-0'
          />
          <History />
        </div>
      </PageTransition>
  );
}