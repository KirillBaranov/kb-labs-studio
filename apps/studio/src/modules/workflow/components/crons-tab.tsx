/**
 * @module @kb-labs/studio-app/modules/workflow/components/crons-tab
 * Cron jobs list view with schedule and status
 */

import * as React from 'react';
import { Table, Tag, Space, Typography, Badge } from 'antd';
import { ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import { KBCard } from '@kb-labs/studio-ui-react';
import type { CronInfo } from '@kb-labs/workflow-contracts';

const { Text } = Typography;

export function CronsTab() {
  const sources = useDataSources();

  const { data: cronsData, isLoading } = useQuery({
    queryKey: ['workflow', 'crons'],
    queryFn: () => sources.workflow.listCronJobs(),
  });

  const formatDate = (date?: Date | string) => {
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  const columns = [
    {
      title: 'Cron ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Text className="typo-body" strong>{id}</Text>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <Space className="gap-tight">
          <ClockCircleOutlined className="text-secondary" />
          <Text className="typo-caption" code>{schedule}</Text>
        </Space>
      ),
    },
    {
      title: 'Job Type',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType: string) => (
        <Text className="typo-body">{jobType}</Text>
      ),
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
      render: (timezone?: string) => (
        <Text className="typo-caption">{timezone || 'UTC'}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge
          status={enabled ? 'success' : 'default'}
          text={
            <Text className="typo-caption">
              {enabled ? 'Enabled' : 'Disabled'}
            </Text>
          }
        />
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date?: Date | string) => (
        <Space className="gap-tight">
          <CalendarOutlined className="text-secondary" />
          <Text className="typo-caption">{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (date?: Date | string) => (
        date ? (
          <Space className="gap-tight">
            <CalendarOutlined className="text-info" />
            <Text className="typo-caption">{formatDate(date)}</Text>
          </Space>
        ) : (
          <Text className="typo-caption text-tertiary">—</Text>
        )
      ),
    },
    {
      title: 'Plugin',
      dataIndex: 'pluginId',
      key: 'pluginId',
      render: (pluginId?: string) => (
        pluginId ? (
          <Tag color="blue">{pluginId}</Tag>
        ) : (
          <Text className="typo-caption text-tertiary">—</Text>
        )
      ),
    },
  ];

  const enabledCount = cronsData?.crons?.filter((c) => c.enabled).length || 0;
  const disabledCount = cronsData?.crons?.filter((c) => !c.enabled).length || 0;

  return (
    <Space direction="vertical" className="gap-section" style={{ width: '100%' }}>
      <KBCard>
        <Space className="gap-section">
          <div>
            <Text className="typo-label text-secondary">Total Cron Jobs</Text>
            <div>
              <Text className="typo-section-title">{cronsData?.crons?.length || 0}</Text>
            </div>
          </div>
          <div>
            <Text className="typo-label text-secondary">Enabled</Text>
            <div>
              <Text className="typo-section-title text-success">{enabledCount}</Text>
            </div>
          </div>
          <div>
            <Text className="typo-label text-secondary">Disabled</Text>
            <div>
              <Text className="typo-section-title">{disabledCount}</Text>
            </div>
          </div>
        </Space>
      </KBCard>

      <KBCard>
        <Table
          dataSource={cronsData?.crons || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <Text className="typo-caption">Total {total} cron jobs</Text>
            ),
          }}
        />
      </KBCard>
    </Space>
  );
}
