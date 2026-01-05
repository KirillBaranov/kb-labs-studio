/**
 * @module @kb-labs/studio-app/modules/release/components/history-tab
 * History Tab - Timeline of past releases with details
 */

import { useState } from 'react';
import {
  Card,
  Empty,
  Spin,
  Timeline,
  Typography,
  Tag,
  Button,
  Modal,
  Descriptions,
  Tabs,
  Space,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseHistory,
  useHistoryReport,
  useHistoryPlan,
  useHistoryChangelog,
} from '@kb-labs/studio-data-client';
import { MarkdownViewer } from '@/components/markdown';
import type { ReleaseHistoryItem } from '@kb-labs/release-manager-contracts';

const { Title, Text } = Typography;

interface HistoryTabProps {
  selectedScope: string;
}

export function HistoryTab({ selectedScope }: HistoryTabProps) {
  const sources = useDataSources();
  const [selectedReleaseId, setSelectedReleaseId] = useState<string | null>(null);
  const [selectedReleaseScope, setSelectedReleaseScope] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch history
  const { data: historyData, isLoading: historyLoading, error: historyError } = useReleaseHistory(
    sources.release,
    true
  );

  // Debug logging
  console.log('History Tab Debug:', {
    isLoading: historyLoading,
    hasData: !!historyData,
    releases: historyData?.releases,
    error: historyError,
  });

  // Fetch details for selected release
  const { data: reportData } = useHistoryReport(
    sources.release,
    selectedReleaseScope,
    selectedReleaseId || '',
    !!selectedReleaseId && !!selectedReleaseScope
  );

  const { data: planData } = useHistoryPlan(
    sources.release,
    selectedReleaseScope,
    selectedReleaseId || '',
    !!selectedReleaseId && !!selectedReleaseScope
  );

  const { data: changelogData } = useHistoryChangelog(
    sources.release,
    selectedReleaseScope,
    selectedReleaseId || '',
    !!selectedReleaseId && !!selectedReleaseScope
  );

  const handleViewDetails = (id: string, scope: string) => {
    setSelectedReleaseId(id);
    setSelectedReleaseScope(scope);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedReleaseId(null);
    setSelectedReleaseScope('');
  };

  if (historyLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  if (historyError) {
    return (
      <Card>
        <Empty
          description={`Failed to load history: ${historyError instanceof Error ? historyError.message : 'Unknown error'}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  // Filter by scope if needed
  const filteredReleases = historyData?.releases
    ? selectedScope
      ? historyData.releases.filter((r) => r.scope === selectedScope)
      : historyData.releases
    : [];

  if (filteredReleases.length === 0) {
    return (
      <Card>
        <Empty
          description={selectedScope
            ? `No release history for scope "${selectedScope}" yet`
            : "No release history yet"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'success' : 'error';
  };

  const timelineItems = filteredReleases.map((release) => ({
    dot: getStatusIcon(release.success),
    children: (
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Tag color="blue">{release.scope}</Tag>
            <Tag color={getStatusColor(release.success)}>{release.success ? 'Success' : 'Failed'}</Tag>
            <Text type="secondary">{new Date(release.timestamp).toLocaleString()}</Text>
          </Space>
          <Text>
            Released {release.packages.length} package(s)
          </Text>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(release.id, release.scope)}
            size="small"
          >
            View Details
          </Button>
        </Space>
      </Card>
    ),
  }));

  const modalTabItems = [
    {
      key: 'report',
      label: 'Report',
      children: reportData?.report ? (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Release ID">{reportData.id}</Descriptions.Item>
          <Descriptions.Item label="Scope">{reportData.report.scope}</Descriptions.Item>
          <Descriptions.Item label="Stage">{reportData.report.stage}</Descriptions.Item>
          <Descriptions.Item label="Timestamp">
            {new Date(reportData.report.ts).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={reportData.report.result?.ok ? 'success' : 'error'}>
              {reportData.report.result?.ok ? 'Success' : 'Failed'}
            </Tag>
          </Descriptions.Item>
          {reportData.report.result?.timingMs && (
            <Descriptions.Item label="Duration">
              {reportData.report.result.timingMs}ms
            </Descriptions.Item>
          )}
          {reportData.report.result?.published && (
            <Descriptions.Item label="Packages Published">
              {reportData.report.result.published.length}
            </Descriptions.Item>
          )}
        </Descriptions>
      ) : (
        <Spin />
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      children: planData?.plan ? (
        <div>
          <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Scope">{planData.plan.scope}</Descriptions.Item>
            <Descriptions.Item label="Strategy">{planData.plan.strategy}</Descriptions.Item>
            <Descriptions.Item label="Packages">{planData.plan.packages.length}</Descriptions.Item>
            <Descriptions.Item label="Rollback">
              {planData.plan.rollbackEnabled ? 'Enabled' : 'Disabled'}
            </Descriptions.Item>
          </Descriptions>
          {planData.plan.packages.map((pkg, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 8 }}>
              <Space direction="vertical" size="small">
                <Text strong>{pkg.name}</Text>
                <Space>
                  <Tag color="blue">{pkg.currentVersion}</Tag>
                  →
                  <Tag color="green">{pkg.nextVersion}</Tag>
                  <Tag>{pkg.bump}</Tag>
                </Space>
                <Text type="secondary">{pkg.reason}</Text>
              </Space>
            </Card>
          ))}
        </div>
      ) : (
        <Spin />
      ),
    },
    {
      key: 'changelog',
      label: 'Changelog',
      children: changelogData?.markdown ? (
        <MarkdownViewer>{changelogData.markdown}</MarkdownViewer>
      ) : (
        <Spin />
      ),
    },
  ];

  return (
    <Card title={<Title level={4} style={{ margin: 0 }}>Release History</Title>}>
      <Timeline items={timelineItems} />

      <Modal
        title={`Release Details - ${selectedReleaseId}`}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
      >
        <Tabs items={modalTabItems} />
      </Modal>
    </Card>
  );
}
