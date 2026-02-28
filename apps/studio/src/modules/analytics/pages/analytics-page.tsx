import { EmptyState } from '@/components/empty-state';
import { BarChart3 } from 'lucide-react';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

export function AnalyticsPage() {
  return (
    <KBPageContainer>
      <KBPageHeader 
        title="Analytics"
        description="Event metrics and performance charts"
      />
      <EmptyState
        icon={<BarChart3 size={32} />}
        title="Coming Soon"
        description="Event metrics and performance charts will appear here."
      />
    </KBPageContainer>
  );
}

