/**
 * @module @kb-labs/studio-app/modules/workflow/pages/workflow-page
 * Workflow Dashboard - Main page with tabs and running jobs panel
 */

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const params = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const sources = useDataSources();

  const activeTab = params.tab || 'workflows';

  const { data: stats } = useQuery<DashboardStatsResponse>({
    queryKey: ['workflow', 'stats'],
    queryFn: () => sources.workflow.getStats(),
    refetchInterval: 10000, // Refresh every 10s for overview stats
  });

  const handleTabChange = (key: string) => {
    navigate(`/workflow/${key}`);
  };

  const tabItems = [
    {
      key: 'workflows',
      label: (
        <UISpace className="gap-tight">
          <UIIcon name="AppstoreOutlined" />
          <span>Workflows</span>
        </UISpace>
      ),
      children: <WorkflowsTab />,
    },
    {
      key: 'jobs',
      label: (
        <UISpace className="gap-tight">
          <UIIcon name="UnorderedListOutlined" />
          <span>Background Jobs</span>
        </UISpace>
      ),
      children: <JobsTab />,
    },
    {
      key: 'crons',
      label: (
        <UISpace className="gap-tight">
          <UIIcon name="ClockCircleOutlined" />
          <span>Cron Jobs</span>
        </UISpace>
      ),
      children: <CronsTab />,
    },
    {
      key: 'history',
      label: (
        <UISpace className="gap-tight">
          <UIIcon name="HistoryOutlined" />
          <span>History</span>
        </UISpace>
      ),
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
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
      />
    </KBPageContainer>
  );
}
