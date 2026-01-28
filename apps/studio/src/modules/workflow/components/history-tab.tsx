/**
 * @module @kb-labs/studio-app/modules/workflow/components/history-tab
 * Recent activity and completed jobs history
 */

import * as React from 'react';
import { Table, Tag, Space, Typography, Timeline } from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import { KBCard } from '@kb-labs/studio-ui-react';
import type { DashboardStatsResponse } from '@kb-labs/workflow-contracts';

const { Text } = Typography;

const STATUS_ICONS = {
  completed: <CheckCircleOutlined className="text-success" />,
  failed: <CloseCircleOutlined className="text-error" />,
  cancelled: <StopOutlined className="text-warning" />,
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'success',
  failed: 'error',
  cancelled: 'warning',
};

export function HistoryTab() {
  const sources = useDataSources();

  const { data: stats, isLoading } = useQuery<DashboardStatsResponse>({
    queryKey: ['workflow', 'stats'],
    queryFn: () => sources.workflow.getStats(),
  });

  const recentActivity = stats?.recentActivity || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {return 'Just now';}
    if (diffMins < 60) {return `${diffMins}m ago`;}
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {return `${diffHours}h ago`;}
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatDuration = (ms?: number) => {
    if (!ms) {return '—';}
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {return `${seconds}s`;}
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {return `${minutes}m ${seconds % 60}s`;}
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const columns = [
    {
      title: 'Time',
      dataIndex: 'finishedAt',
      key: 'finishedAt',
      render: (date: string) => (
        <Space className="gap-tight">
          <ClockCircleOutlined className="text-secondary" />
          <Text className="typo-caption">{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: 'Workflow / Job',
      dataIndex: 'workflowName',
      key: 'workflowName',
      render: (name: string | undefined, record: typeof recentActivity[0]) => (
        <Space direction="vertical" className="gap-tight">
          <Text className="typo-body">{name || record.type}</Text>
          <Text className="typo-caption text-tertiary" code>
            {record.id.slice(0, 12)}...
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'completed' | 'failed' | 'cancelled') => (
        <Tag
          icon={STATUS_ICONS[status]}
          color={STATUS_COLORS[status]}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMs',
      key: 'durationMs',
      render: (ms?: number) => (
        <Text className="typo-caption">{formatDuration(ms)}</Text>
      ),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error?: string) => (
        error ? (
          <Text className="typo-caption text-error" ellipsis={{ tooltip: error }}>
            {error}
          </Text>
        ) : (
          <Text className="typo-caption text-tertiary">—</Text>
        )
      ),
    },
  ];

  return (
    <Space direction="vertical" className="gap-section" style={{ width: '100%' }}>
      <KBCard title={<Text className="typo-card-title">Recent Activity Timeline</Text>}>
        <Timeline
          items={recentActivity.slice(0, 10).map((activity) => ({
            dot: STATUS_ICONS[activity.status],
            children: (
              <Space direction="vertical" className="gap-tight">
                <Space className="gap-item">
                  <Text className="typo-body" strong>
                    {activity.workflowName || activity.type}
                  </Text>
                  <Tag color={STATUS_COLORS[activity.status]}>
                    {activity.status.toUpperCase()}
                  </Tag>
                </Space>
                <Text className="typo-description text-secondary">
                  {formatDate(activity.finishedAt)} • {formatDuration(activity.durationMs)}
                </Text>
                {activity.error && (
                  <Text className="typo-caption text-error">{activity.error}</Text>
                )}
              </Space>
            ),
          }))}
        />
      </KBCard>

      <KBCard title={<Text className="typo-card-title">All Recent Activity</Text>}>
        <Table
          dataSource={recentActivity}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <Text className="typo-caption">Total {total} activities</Text>
            ),
          }}
        />
      </KBCard>
    </Space>
  );
}
