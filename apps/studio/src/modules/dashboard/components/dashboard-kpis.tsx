import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import { StatCard, StatGrid } from '@kb-labs/ui-react';

export function DashboardKpis() {
  const sources = useDataSources();
  const { data, isLoading } = useAuditSummary(sources.audit);

  if (isLoading) {
    return <div>Loading KPIs...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return (
    <StatGrid columns={4}>
      <StatCard label="Audit Duration" value={`${data.totals.durationMs}ms`} />
      <StatCard label="Packages OK" value={`${data.totals.ok}/${data.totals.packages}`} variant="positive" />
      <StatCard label="Failed" value={data.totals.fail} variant="negative" />
      <StatCard label="Warnings" value={data.totals.warn} variant="warning" />
    </StatGrid>
  );
}

