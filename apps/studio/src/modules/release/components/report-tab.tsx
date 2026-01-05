/**
 * @module @kb-labs/studio-app/modules/release/components/report-tab
 * Report Tab - Latest release report
 */

import { Card, Empty, Spin, Descriptions, Tag, Typography } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleaseReport } from '@kb-labs/studio-data-client';

const { Title } = Typography;

export function ReportTab() {
  const sources = useDataSources();

  // Fetch latest report
  const { data: reportData, isLoading } = useReleaseReport(sources.release, true);

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (!reportData?.hasReport || !reportData.report) {
    return (
      <Card>
        <Empty description="No release report available yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    );
  }

  const { report } = reportData;

  const getStatusIcon = (status: typeof report.status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 48 }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 48 }} />;
      default:
        return <ClockCircleOutlined style={{ color: '#1890ff', fontSize: 48 }} />;
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
    <Card title={<Title level={4} style={{ margin: 0 }}>Latest Release Report</Title>}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {getStatusIcon(report.status)}
        <div style={{ marginTop: 16 }}>
          <Tag color={getStatusColor(report.status)} style={{ fontSize: 16, padding: '4px 16px' }}>
            {report.status.toUpperCase()}
          </Tag>
        </div>
      </div>

      <Descriptions bordered column={1}>
        <Descriptions.Item label="Release ID">{report.releaseId}</Descriptions.Item>
        <Descriptions.Item label="Scope">
          <Tag color="blue">{report.scope}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={getStatusColor(report.status)}>{report.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Timestamp">
          {new Date(report.timestamp).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Packages Released">{report.packagesReleased}</Descriptions.Item>
        <Descriptions.Item label="Duration">{report.duration}ms ({(report.duration / 1000).toFixed(2)}s)</Descriptions.Item>
        <Descriptions.Item label="Summary">{report.summary}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
