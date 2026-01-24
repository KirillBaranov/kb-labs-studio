/**
 * @module @kb-labs/studio-app/modules/workflow/pages/workflow-page
 * Workflow Dashboard - Main page with tabs and running jobs panel
 */

import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Row, Col, Space, Typography } from 'antd';
import {
  ThunderboltOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader, KBCard } from '@kb-labs/studio-ui-react';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import { RunningNowPanel } from '../components/running-now-panel';
import { WorkflowsTab } from '../components/workflows-tab';
import { JobsTab } from '../components/jobs-tab';
import { CronsTab } from '../components/crons-tab';
import { HistoryTab } from '../components/history-tab';
import type { DashboardStatsResponse } from '@kb-labs/workflow-contracts';

const { Text } = Typography;

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
        <Space className="gap-tight">
          <AppstoreOutlined />
          <span>Workflows</span>
        </Space>
      ),
      children: <WorkflowsTab />,
    },
    {
      key: 'jobs',
      label: (
        <Space className="gap-tight">
          <UnorderedListOutlined />
          <span>Background Jobs</span>
        </Space>
      ),
      children: <JobsTab />,
    },
    {
      key: 'crons',
      label: (
        <Space className="gap-tight">
          <ClockCircleOutlined />
          <span>Cron Jobs</span>
        </Space>
      ),
      children: <CronsTab />,
    },
    {
      key: 'history',
      label: (
        <Space className="gap-tight">
          <HistoryOutlined />
          <span>History</span>
        </Space>
      ),
      children: <HistoryTab />,
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Workflow Dashboard"
        description="Monitor workflows, jobs, and scheduled tasks"
        icon={<ThunderboltOutlined />}
      />

      {/* Overview Stats */}
      <KBCard style={{ marginBottom: 'var(--spacing-section)' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Space direction="vertical" className="gap-tight">
              <Text className="typo-label text-secondary">Total Workflows</Text>
              <Text className="typo-section-title">{stats?.workflows.total || 0}</Text>
              <Space className="gap-tight">
                <Text className="typo-caption text-success">
                  {stats?.workflows.active || 0} active
                </Text>
                <Text className="typo-caption text-secondary">
                  {stats?.workflows.inactive || 0} inactive
                </Text>
              </Space>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" className="gap-tight">
              <Text className="typo-label text-secondary">Jobs Running</Text>
              <Text className="typo-section-title text-info">
                {stats?.jobs.running || 0}
              </Text>
              <Space className="gap-tight">
                <Text className="typo-caption text-secondary">
                  {stats?.jobs.pending || 0} pending
                </Text>
              </Space>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" className="gap-tight">
              <Text className="typo-label text-secondary">Jobs Completed</Text>
              <Text className="typo-section-title text-success">
                {stats?.jobs.completed || 0}
              </Text>
              <Space className="gap-tight">
                <Text className="typo-caption text-error">
                  {stats?.jobs.failed || 0} failed
                </Text>
              </Space>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" className="gap-tight">
              <Text className="typo-label text-secondary">Cron Jobs</Text>
              <Text className="typo-section-title">{stats?.crons.total || 0}</Text>
              <Space className="gap-tight">
                <Text className="typo-caption text-success">
                  {stats?.crons.enabled || 0} enabled
                </Text>
                <Text className="typo-caption text-secondary">
                  {stats?.crons.disabled || 0} disabled
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </KBCard>

      {/* Running Now Panel */}
      <RunningNowPanel />

      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
      />
    </KBPageContainer>
  );
}
