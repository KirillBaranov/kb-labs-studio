/**
 * @module @kb-labs/studio-app/modules/workflow/pages/workflow-page
 * Workflow Dashboard - Main page with tabs and running jobs panel
 */

import * as React from 'react';
import {
  UITabs,
  UIRow,
  UICol,
  UISpace,
  UITypographyText,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import { RunningNowPanel } from '../components/running-now-panel';
import { WorkflowsTab } from '../components/workflows-tab';
import { JobsTab } from '../components/jobs-tab';
import { CronsTab } from '../components/crons-tab';
import { HistoryTab } from '../components/history-tab';
import type { DashboardStatsResponse } from '@kb-labs/workflow-contracts';
import { UICard } from '@kb-labs/studio-ui-kit';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

export function WorkflowPage() {
  const sources = useDataSources();

  const { data: stats } = useQuery<DashboardStatsResponse>({
    queryKey: ['workflow', 'stats'],
    queryFn: () => sources.workflow.getStats(),
    refetchInterval: 10000,
  });

  const tabItems = [
    {
      key: 'workflows',
      label: 'Workflows',
      icon: <UIIcon name="AppstoreOutlined" />,
      children: <WorkflowsTab />,
    },
    {
      key: 'jobs',
      label: 'Background Jobs',
      icon: <UIIcon name="UnorderedListOutlined" />,
      children: <JobsTab />,
    },
    {
      key: 'crons',
      label: 'Cron Jobs',
      icon: <UIIcon name="ClockCircleOutlined" />,
      children: <CronsTab />,
    },
    {
      key: 'history',
      label: 'History',
      icon: <UIIcon name="HistoryOutlined" />,
      children: <HistoryTab />,
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Workflow Dashboard"
        description="Monitor workflows, jobs, and scheduled tasks"
        icon={<UIIcon name="ThunderboltOutlined" />}
      />

      {/* Overview Stats */}
      <UICard style={{ marginBottom: 'var(--spacing-section)' }}>
        <UIRow gutter={16}>
          <UICol span={6}>
            <UISpace direction="vertical" className="gap-tight">
              <UITypographyText className="typo-label text-secondary">Total Workflows</UITypographyText>
              <UITypographyText className="typo-section-title">{stats?.workflows.total || 0}</UITypographyText>
              <UISpace className="gap-tight">
                <UITypographyText className="typo-caption text-success">
                  {stats?.workflows.active || 0} active
                </UITypographyText>
                <UITypographyText className="typo-caption text-secondary">
                  {stats?.workflows.inactive || 0} inactive
                </UITypographyText>
              </UISpace>
            </UISpace>
          </UICol>
          <UICol span={6}>
            <UISpace direction="vertical" className="gap-tight">
              <UITypographyText className="typo-label text-secondary">Jobs Running</UITypographyText>
              <UITypographyText className="typo-section-title text-info">
                {stats?.jobs.running || 0}
              </UITypographyText>
              <UISpace className="gap-tight">
                <UITypographyText className="typo-caption text-secondary">
                  {stats?.jobs.pending || 0} pending
                </UITypographyText>
              </UISpace>
            </UISpace>
          </UICol>
          <UICol span={6}>
            <UISpace direction="vertical" className="gap-tight">
              <UITypographyText className="typo-label text-secondary">Jobs Completed</UITypographyText>
              <UITypographyText className="typo-section-title text-success">
                {stats?.jobs.completed || 0}
              </UITypographyText>
              <UISpace className="gap-tight">
                <UITypographyText className="typo-caption text-error">
                  {stats?.jobs.failed || 0} failed
                </UITypographyText>
              </UISpace>
            </UISpace>
          </UICol>
          <UICol span={6}>
            <UISpace direction="vertical" className="gap-tight">
              <UITypographyText className="typo-label text-secondary">Cron Jobs</UITypographyText>
              <UITypographyText className="typo-section-title">{stats?.crons.total || 0}</UITypographyText>
              <UISpace className="gap-tight">
                <UITypographyText className="typo-caption text-success">
                  {stats?.crons.enabled || 0} enabled
                </UITypographyText>
                <UITypographyText className="typo-caption text-secondary">
                  {stats?.crons.disabled || 0} disabled
                </UITypographyText>
              </UISpace>
            </UISpace>
          </UICol>
        </UIRow>
      </UICard>

      {/* Running Now Panel */}
      <RunningNowPanel />

      {/* Main Tabs */}
      <UITabs
        items={tabItems}
        syncUrl={{ mode: 'path', basePath: '/workflow' }}
        size="large"
      />
    </KBPageContainer>
  );
}
