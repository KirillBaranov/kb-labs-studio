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

  const getStatusIcon = (status: typeof report.status) => {
    switch (status) {
      case 'completed':
        return <UIIcon name="CheckCircleOutlined" style={{ color: '#52c41a', fontSize: 48 }} />;
      case 'failed':
        return <UIIcon name="CloseCircleOutlined" style={{ color: '#ff4d4f', fontSize: 48 }} />;
      default:
        return <UIIcon name="ClockCircleOutlined" style={{ color: '#1890ff', fontSize: 48 }} />;
    }
  };

  const getStatusColor = (status: typeof report.status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'processing';
    }
  };

  return (
    <UICard title={<UITitle level={4} style={{ margin: 0 }}>Latest Release Report</UITitle>}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {getStatusIcon(report.status)}
        <div style={{ marginTop: 16 }}>
          <UITag color={getStatusColor(report.status)} style={{ fontSize: 16, padding: '4px 16px' }}>
            {report.status.toUpperCase()}
          </UITag>
        </div>
      </div>

      <UIDescriptions bordered column={1}>
        <UIDescriptionsItem label="Release ID">{report.releaseId}</UIDescriptionsItem>
        <UIDescriptionsItem label="Scope">
          <UITag color="blue">{report.scope}</UITag>
        </UIDescriptionsItem>
        <UIDescriptionsItem label="Status">
          <UITag color={getStatusColor(report.status)}>{report.status}</UITag>
        </UIDescriptionsItem>
        <UIDescriptionsItem label="Timestamp">
          {new Date(report.timestamp).toLocaleString()}
        </UIDescriptionsItem>
        <UIDescriptionsItem label="Packages Released">{report.packagesReleased}</UIDescriptionsItem>
        <UIDescriptionsItem label="Duration">{report.duration}ms ({(report.duration / 1000).toFixed(2)}s)</UIDescriptionsItem>
        <UIDescriptionsItem label="Summary">{report.summary}</UIDescriptionsItem>
      </UIDescriptions>
    </UICard>
  );
}
