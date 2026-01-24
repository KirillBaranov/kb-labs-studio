/**
 * @module @kb-labs/studio-app/modules/workflow/components/running-now-panel
 * Collapsible panel showing actively running jobs with auto-refresh
 */

import * as React from 'react';
import { Collapse, List, Progress, Space, Typography, Badge, Button } from 'antd';
import {
  ThunderboltOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { DashboardStatsResponse } from '@kb-labs/workflow-contracts';

const { Text } = Typography;

export function RunningNowPanel() {
  const sources = useDataSources();

  // Auto-refresh every 3 seconds
  const { data: stats, isLoading, refetch } = useQuery<DashboardStatsResponse>({
    queryKey: ['workflow', 'stats'],
    queryFn: () => sources.workflow.getStats(),
    refetchInterval: 3000,
  });

  const activeExecutions = stats?.activeExecutions || [];
  const hasRunningJobs = activeExecutions.length > 0;

  const formatDuration = (ms?: number) => {
    if (!ms) return '—';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const items = [
    {
      key: 'running',
      label: (
        <Space>
          <ThunderboltOutlined className="text-info" />
          <Text className="typo-label">Running Now</Text>
          <Badge count={activeExecutions.length} className="bg-theme-primary" />
        </Space>
      ),
      extra: (
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined spin={isLoading} />}
          onClick={(e) => {
            e.stopPropagation();
            refetch();
          }}
        />
      ),
      children: activeExecutions.length > 0 ? (
        <List
          dataSource={activeExecutions}
          renderItem={(execution) => (
            <List.Item>
              <List.Item.Meta
                title={
                  <Space>
                    <Text className="typo-body">
                      {execution.workflowName || execution.type}
                    </Text>
                    {execution.progress !== undefined && (
                      <Text className="typo-caption text-secondary">
                        {execution.progress}%
                      </Text>
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" className="gap-tight" style={{ width: '100%' }}>
                    {execution.progressMessage && (
                      <Text className="typo-description">{execution.progressMessage}</Text>
                    )}
                    <Space className="gap-item">
                      <ClockCircleOutlined className="text-secondary" />
                      <Text className="typo-caption text-secondary">
                        {formatDuration(execution.durationMs)}
                      </Text>
                      <Text className="typo-caption text-tertiary">
                        ID: {execution.id.slice(0, 8)}
                      </Text>
                    </Space>
                  </Space>
                }
              />
              {execution.progress !== undefined && (
                <Progress
                  percent={execution.progress}
                  size="small"
                  status="active"
                  style={{ width: 120 }}
                />
              )}
            </List.Item>
          )}
        />
      ) : (
        <Text className="typo-description text-secondary">No active executions</Text>
      ),
    },
  ];

  return (
    <Collapse
      items={items}
      defaultActiveKey={hasRunningJobs ? ['running'] : []}
      style={{
        marginBottom: 'var(--spacing-section)',
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    />
  );
}
