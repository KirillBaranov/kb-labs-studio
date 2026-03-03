/**
 * @module @kb-labs/studio-app/modules/workflow/components/running-now-panel
 * Collapsible panel showing actively running jobs with auto-refresh
 */

import * as React from 'react';
import {
  UIAccordion,
  UIList,
  UIProgress,
  UISpace,
  UITypographyText,
  UIBadge,
  UIButton,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { DashboardStatsResponse } from '@kb-labs/workflow-contracts';

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
    if (!ms) {return '—';}
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {return `${seconds}s`;}
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {return `${minutes}m ${seconds % 60}s`;}
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const items = [
    {
      key: 'running',
      label: `Running Now (${activeExecutions.length})`,
      extra: (
        <UIButton
          variant="text"
          size="small"
          icon={<UIIcon name="ReloadOutlined" spin={isLoading} />}
          onClick={(e) => {
            e.stopPropagation();
            refetch();
          }}
        />
      ),
      children: activeExecutions.length > 0 ? (
        <UIList
          dataSource={activeExecutions}
          renderItem={(execution) => (
            <UIList.Item>
              <UIList.Item.Meta
                title={
                  <UISpace>
                    <UITypographyText className="typo-body">
                      {execution.workflowName || execution.type}
                    </UITypographyText>
                    {execution.progress !== undefined && (
                      <UITypographyText className="typo-caption text-secondary">
                        {execution.progress}%
                      </UITypographyText>
                    )}
                  </UISpace>
                }
                description={
                  <UISpace direction="vertical" className="gap-tight" style={{ width: '100%' }}>
                    {execution.progressMessage && (
                      <UITypographyText className="typo-description">{execution.progressMessage}</UITypographyText>
                    )}
                    <UISpace className="gap-item">
                      <UIIcon name="ClockCircleOutlined" className="text-secondary" />
                      <UITypographyText className="typo-caption text-secondary">
                        {formatDuration(execution.durationMs)}
                      </UITypographyText>
                      <UITypographyText className="typo-caption text-tertiary">
                        ID: {execution.id.slice(0, 8)}
                      </UITypographyText>
                    </UISpace>
                  </UISpace>
                }
              />
              {execution.progress !== undefined && (
                <UIProgress
                  percent={execution.progress}
                  size="small"
                  status="active"
                  style={{ width: 120 }}
                />
              )}
            </UIList.Item>
          )}
        />
      ) : (
        <UITypographyText className="typo-description text-secondary">No active executions</UITypographyText>
      ),
    },
  ];

  return (
    <UIAccordion
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
