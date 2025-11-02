import { Link } from 'lucide-react';
import { PageContainer, PageHeader } from '@kb-labs/ui-react';
import { EmptyState } from '@/components/empty-state';

export function DevlinkPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="DevLink"
        description="Dependency graph and cycle detection"
      />
      <EmptyState icon={Link} title="Coming Soon" description="Dependency graph and cycle detection will appear here." />
    </PageContainer>
  );
}

