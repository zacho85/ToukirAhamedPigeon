import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import CryptoExchange from '../components/CryptoExchange';

export default function CryptoExchangePage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.crypto_exchange.title"
            defaultTitle="Crypto Exchange"
            showTitle={true}
            items={[
                { label: "Crypto Exchange", href: "/crypto-exchange" },
            ]}
            className='pb-0'
          />
          <CryptoExchange />
        </div>
      </PageTransition>
  );
}
