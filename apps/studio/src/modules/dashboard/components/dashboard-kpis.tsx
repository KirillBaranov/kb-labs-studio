import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import { KBStatCard, KBStatGrid, KBSkeleton } from '@kb-labs/ui-react';

export function DashboardKpis() {
  const sources = useDataSources();
  const { data, isLoading } = useAuditSummary(sources.audit);

  if (isLoading) {
    return (
      <KBStatGrid columns={4}>
        <KBSkeleton active paragraph={{ rows: 2 }} />
        <KBSkeleton active paragraph={{ rows: 2 }} />
        <KBSkeleton active paragraph={{ rows: 2 }} />
        <KBSkeleton active paragraph={{ rows: 2 }} />
      </KBStatGrid>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <KBStatGrid columns={4}>
      <KBStatCard label="Audit Duration" value={`${data.totals.durationMs}ms`} />
      <KBStatCard label="Packages OK" value={`${data.totals.ok}/${data.totals.packages}`} variant="positive" />
      <KBStatCard label="Failed" value={data.totals.fail} variant="negative" />
      <KBStatCard label="Warnings" value={data.totals.warn} variant="warning" />
    </KBStatGrid>
  );
}

