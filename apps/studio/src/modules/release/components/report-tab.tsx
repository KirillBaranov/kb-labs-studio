/**
 * @module @kb-labs/studio-app/modules/release/components/report-tab
 * Report Tab - Latest release report
 */

import { UICard, UIEmptyState, UISpin, UIDescriptions, UIDescriptionsItem, UITag, UITitle, UIIcon } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleaseReport } from '@kb-labs/studio-data-client';

export function ReportTab() {
  const sources = useDataSources();

  // Fetch latest report
  const { data: reportData, isLoading } = useReleaseReport(sources.release, true);

  if (isLoading) {
    return <UISpin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (!reportData?.hasReport || !reportData.report) {
    return (
      <UICard>
        <UIEmptyState description="No release report available yet" image={UIEmptyState.PRESENTED_IMAGE_SIMPLE} />
      </UICard>
    );
  }

  const { report } = reportData;

  const getStatusIcon = (ok: boolean) => {
    if (ok) {
      return <UIIcon name="CheckCircleOutlined" style={{ color: '#52c41a', fontSize: 48 }} />;
    }
    return <UIIcon name="CloseCircleOutlined" style={{ color: '#ff4d4f', fontSize: 48 }} />;
  };

  const getStatusColor = (ok: boolean) => {
    return ok ? 'success' : 'error';
  };

  const ok = report.result.ok;

  return (
    <UICard title={<UITitle level={4} style={{ margin: 0 }}>Latest Release Report</UITitle>}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {getStatusIcon(ok)}
        <div style={{ marginTop: 16 }}>
          <UITag color={getStatusColor(ok)} style={{ fontSize: 16, padding: '4px 16px' }}>
            {report.stage.toUpperCase()}
          </UITag>
        </div>
      </div>

      <UIDescriptions bordered column={1}>
        <UIDescriptionsItem label="Scope">
          <UITag color="blue">{report.scope}</UITag>
        </UIDescriptionsItem>
        <UIDescriptionsItem label="Stage">
          <UITag color={getStatusColor(ok)}>{report.stage}</UITag>
        </UIDescriptionsItem>
        <UIDescriptionsItem label="Timestamp">
          {new Date(report.ts).toLocaleString()}
        </UIDescriptionsItem>
        {report.result.version && (
          <UIDescriptionsItem label="Version">{report.result.version}</UIDescriptionsItem>
        )}
        {report.result.published && (
          <UIDescriptionsItem label="Packages Published">{report.result.published.length}</UIDescriptionsItem>
        )}
        <UIDescriptionsItem label="Duration">{report.result.timingMs}ms ({(report.result.timingMs / 1000).toFixed(2)}s)</UIDescriptionsItem>
        {report.result.errors && report.result.errors.length > 0 && (
          <UIDescriptionsItem label="Errors">{report.result.errors.join(', ')}</UIDescriptionsItem>
        )}
      </UIDescriptions>
    </UICard>
  );
}
