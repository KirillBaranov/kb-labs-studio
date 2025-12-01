import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { EmptyState } from '@/components/empty-state';
import { Brain } from 'lucide-react';

export function MindPage() {
  return (
    <KBPageContainer>
      <KBPageHeader 
        title="Mind"
        description="Knowledge freshness verification"
      />
      <EmptyState
        icon={<Brain size={32} />}
        title="Coming Soon"
        description="Knowledge freshness verification will appear here."
      />
    </KBPageContainer>
  );
}

