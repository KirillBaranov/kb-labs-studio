import { KBPageContainer, KBPageHeader } from '@kb-labs/ui-react';
import { DashboardKpis } from '../components/dashboard-kpis';

export function DashboardPage() {
  return (
    <KBPageContainer>
      <KBPageHeader
        title="Dashboard"
        description="KB Labs ecosystem overview"
      />
      <DashboardKpis />
    </KBPageContainer>
  );
}

