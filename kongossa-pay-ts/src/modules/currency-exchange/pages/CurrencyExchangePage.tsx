import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import CurrencyExchange from '../components/CurrencyExchange';

export default function CurrencyExchangePage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.currency_exchange.title"
            defaultTitle="Currency Exchange"
            showTitle={true}
            items={[
                { label: "Currency Exchange", href: "/currency-exchange" },
            ]}
            className='pb-0'
          />
          <CurrencyExchange />
        </div>
      </PageTransition>
  );
}
