import { PageContainer, PageHeader } from '@kb-labs/ui-react';
import { DashboardKpis } from '../components/dashboard-kpis';

export function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Dashboard"
        description="KB Labs ecosystem overview"
      />
      <DashboardKpis />
    </PageContainer>
  );
}

