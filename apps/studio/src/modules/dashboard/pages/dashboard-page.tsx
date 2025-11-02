import { KBPageContainer, KBPageHeader, KBSection } from '@kb-labs/ui-react';
import { DashboardKpis } from '../components/dashboard-kpis';
import { DashboardChart } from '../components/dashboard-chart';

export function DashboardPage() {
  return (
    <KBPageContainer>
      <KBPageHeader
        title="Dashboard"
        description="KB Labs ecosystem overview"
      />
      <DashboardKpis />
      <KBSection>
        <DashboardChart />
      </KBSection>
    </KBPageContainer>
  );
}

