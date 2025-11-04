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

  // Extract totals from data (handle both envelope and direct formats)
  // envelope format: {ok: true, data: {totals: {...}}}
  // direct format: {totals: {...}}
  let totals: { durationMs?: number; ok?: number; packages?: number; fail?: number; warn?: number } | null = null;
  
  if (data && typeof data === 'object') {
    if ('totals' in data && data.totals && typeof data.totals === 'object') {
      totals = data.totals as typeof totals;
    } else if ('data' in data && data.data && typeof data.data === 'object' && 'totals' in data.data) {
      const nestedData = data.data as { totals?: typeof totals };
      if (nestedData.totals && typeof nestedData.totals === 'object') {
        totals = nestedData.totals;
      }
    }
  }

  // Check if totals exists and has required properties
  if (!totals || typeof totals !== 'object') {
    return <div>No totals data available</div>;
  }

  // Use safe access with defaults
  const durationMs = totals.durationMs ?? 0;
  const ok = totals.ok ?? 0;
  const packages = totals.packages ?? 0;
  const fail = totals.fail ?? 0;
  const warn = totals.warn ?? 0;

  return (
    <KBStatGrid columns={4}>
      <KBStatCard label="Audit Duration" value={`${durationMs}ms`} />
      <KBStatCard label="Packages OK" value={`${ok}/${packages}`} variant="positive" />
      <KBStatCard label="Failed" value={fail} variant="negative" />
      <KBStatCard label="Warnings" value={warn} variant="warning" />
    </KBStatGrid>
  );
}

