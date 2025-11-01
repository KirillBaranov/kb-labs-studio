import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import { StatCard } from '@kb-labs/ui-react';

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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="Audit Duration" value={`${data.totals.durationMs}ms`} />
      <StatCard label="Packages OK" value={`${data.totals.ok}/${data.totals.packages}`} variant="positive" />
      <StatCard label="Failed" value={data.totals.fail} variant="negative" />
      <StatCard label="Warnings" value={data.totals.warn} variant="warning" />
    </div>
  );
}

