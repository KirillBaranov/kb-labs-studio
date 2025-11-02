import { BarChart3 } from 'lucide-react';
import { PageContainer, PageHeader } from '@kb-labs/ui-react';
import { EmptyState } from '@/components/empty-state';

export function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Analytics"
        description="Event metrics and performance charts"
      />
      <EmptyState icon={BarChart3} title="Coming Soon" description="Event metrics and performance charts will appear here." />
    </PageContainer>
  );
}

