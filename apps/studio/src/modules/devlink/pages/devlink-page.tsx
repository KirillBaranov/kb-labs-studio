import { Link } from 'lucide-react';
import { KBPageContainer, KBPageHeader } from '@kb-labs/ui-react';
import { EmptyState } from '@/components/empty-state';

export function DevlinkPage() {
  return (
    <KBPageContainer>
      <KBPageHeader 
        title="DevLink"
        description="Dependency graph and cycle detection"
      />
      <EmptyState icon={Link} title="Coming Soon" description="Dependency graph and cycle detection will appear here." />
    </KBPageContainer>
  );
}

