/**
 * @module @kb-labs/studio-app/modules/workflow/components/history-tab
 * Recent activity and completed jobs history
 */

import * as React from 'react';
import {
  UITable,
  UITag,
  UISpace,
  UITypographyText,
  UITimeline,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { DashboardStatsResponse } from '@kb-labs/workflow-contracts';
import { UICard } from '@kb-labs/studio-ui-kit';

const STATUS_ICONS = {
  completed: <UIIcon name="CheckCircleOutlined" className="text-success" />,
  failed: <UIIcon name="CloseCircleOutlined" className="text-error" />,
  cancelled: <UIIcon name="StopOutlined" className="text-warning" />,
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
        <UISpace className="gap-tight">
          <UIIcon name="ClockCircleOutlined" className="text-secondary" />
          <UITypographyText className="typo-caption">{formatDate(date)}</UITypographyText>
        </UISpace>
      ),
    },
    {
      title: 'Workflow / Job',
      dataIndex: 'workflowName',
      key: 'workflowName',
      render: (name: string | undefined, record: typeof recentActivity[0]) => (
        <UISpace direction="vertical" className="gap-tight">
          <UITypographyText className="typo-body">{name || record.type}</UITypographyText>
          <UITypographyText className="typo-caption text-tertiary" code>
            {record.id.slice(0, 12)}...
          </UITypographyText>
        </UISpace>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'completed' | 'failed' | 'cancelled') => (
        <UITag
          icon={STATUS_ICONS[status]}
          color={STATUS_COLORS[status]}
        >
          {status.toUpperCase()}
        </UITag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'durationMs',
      key: 'durationMs',
      render: (ms?: number) => (
        <UITypographyText className="typo-caption">{formatDuration(ms)}</UITypographyText>
      ),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error?: string) => (
        error ? (
          <UITypographyText className="typo-caption text-error" ellipsis={{ tooltip: error }}>
            {error}
          </UITypographyText>
        ) : (
          <UITypographyText className="typo-caption text-tertiary">—</UITypographyText>
        )
      ),
    },
  ];

  return (
    <UISpace direction="vertical" className="gap-section" style={{ width: '100%' }}>
      <UICard title={<UITypographyText className="typo-card-title">Recent Activity Timeline</UITypographyText>}>
        <UITimeline
          items={recentActivity.slice(0, 10).map((activity) => ({
            dot: STATUS_ICONS[activity.status],
            children: (
              <UISpace direction="vertical" className="gap-tight">
                <UISpace className="gap-item">
                  <UITypographyText className="typo-body" strong>
                    {activity.workflowName || activity.type}
                  </UITypographyText>
                  <UITag color={STATUS_COLORS[activity.status]}>
                    {activity.status.toUpperCase()}
                  </UITag>
                </UISpace>
                <UITypographyText className="typo-description text-secondary">
                  {formatDate(activity.finishedAt)} • {formatDuration(activity.durationMs)}
                </UITypographyText>
                {activity.error && (
                  <UITypographyText className="typo-caption text-error">{activity.error}</UITypographyText>
                )}
              </UISpace>
            ),
          }))}
        />
      </UICard>

      <UICard title={<UITypographyText className="typo-card-title">All Recent Activity</UITypographyText>}>
        <UITable
          dataSource={recentActivity}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
          }}
        />
      </UICard>
    </UISpace>
  );
}
