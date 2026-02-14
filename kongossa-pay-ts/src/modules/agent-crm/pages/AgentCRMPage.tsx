import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import AgentCRM from '../components/AgentCRM';

export default function AgentCRMpage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.agent_crm.title"
            defaultTitle="Agent CRM"
            showTitle={true}
            items={[
                { label: "Agent CRM", href: "/agent-crm" },
            ]}
            className='pb-0'
          />
          <AgentCRM />
        </div>
      </PageTransition>
  );
}
