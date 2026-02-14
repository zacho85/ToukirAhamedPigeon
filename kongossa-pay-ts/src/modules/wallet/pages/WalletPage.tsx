import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import Wallet from '../components/Wallet';
import PageTransition from '@/components/module/admin/layout/PageTransition';

export default function WalletPage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.wallet.title"
            defaultTitle="Wallet"
            showTitle={true}
            items={[
                { label: "Wallet", href: "/wallet" },
            ]}
            className='pb-0'
          />
          <Wallet />
        </div>
      </PageTransition>
  );
}
