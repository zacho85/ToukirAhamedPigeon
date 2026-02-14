// import AdminLayout from "@/layouts/AdminLayout";
// import Breadcrumb from '@/components/module/admin/layout/Breadcrumb'
// import Dashboard from './../components/Dashboard';
import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import PageTransition from '@/components/module/admin/layout/PageTransition';
import AgentDashboard from '../components/AgentDashboard';

export default function AgentDashboardPage() {
  return (
    <PageTransition>
      <div className='flex flex-col gap-4'>
        <Breadcrumb
            title="common.agent_dashboard.title"
            defaultTitle="Agent Dashboard"
            showTitle={true}
            items={[
                { label: "Agent Dashboard", href: "/agent-dashboard" },
            ]}
            className='pb-0'
          />
          <AgentDashboard />
        </div>
      </PageTransition>
  );
}
