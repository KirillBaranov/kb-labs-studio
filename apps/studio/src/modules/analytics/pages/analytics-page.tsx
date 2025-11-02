import { BarChart3 } from 'lucide-react';
import { KBPageContainer, KBPageHeader } from '@kb-labs/ui-react';
import { EmptyState } from '@/components/empty-state';

export function AnalyticsPage() {
  return (
    <KBPageContainer>
      <KBPageHeader 
        title="Analytics"
        description="Event metrics and performance charts"
      />
      <EmptyState icon={BarChart3} title="Coming Soon" description="Event metrics and performance charts will appear here." />
    </KBPageContainer>
  );
}

