import { Brain } from 'lucide-react';
import { PageContainer, PageHeader } from '@kb-labs/ui-react';
import { EmptyState } from '@/components/empty-state';

export function MindPage() {
  return (
    <PageContainer>
      <PageHeader 
        title="Mind"
        description="Knowledge freshness verification"
      />
      <EmptyState icon={Brain} title="Coming Soon" description="Knowledge freshness verification will appear here." />
    </PageContainer>
  );
}

