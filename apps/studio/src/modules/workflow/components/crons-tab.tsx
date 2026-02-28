/**
 * @module @kb-labs/studio-app/modules/workflow/components/crons-tab
 * Cron jobs list view with schedule and status
 */

import * as React from 'react';
import {
  UITable,
  UITag,
  UISpace,
  UITypographyText,
  UIBadge,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { CronInfo } from '@kb-labs/workflow-contracts';
import { UICard } from '@kb-labs/studio-ui-kit';

export function CronsTab() {
  const sources = useDataSources();

  const { data: cronsData, isLoading } = useQuery({
    queryKey: ['workflow', 'crons'],
    queryFn: () => sources.workflow.listCronJobs(),
  });

  const formatDate = (date?: Date | string) => {
    if (!date) {return '—';}
    return new Date(date).toLocaleString();
  };

  const columns = [
    {
      title: 'Cron ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <UITypographyText className="typo-body" strong>{id}</UITypographyText>
      ),
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      render: (schedule: string) => (
        <UISpace className="gap-tight">
          <UIIcon name="ClockCircleOutlined" className="text-secondary" />
          <UITypographyText className="typo-caption" code>{schedule}</UITypographyText>
        </UISpace>
      ),
    },
    {
      title: 'Job Type',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType: string) => (
        <UITypographyText className="typo-body">{jobType}</UITypographyText>
      ),
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
      render: (timezone?: string) => (
        <UITypographyText className="typo-caption">{timezone || 'UTC'}</UITypographyText>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <UIBadge
          status={enabled ? 'success' : 'default'}
          text={
            <UITypographyText className="typo-caption">
              {enabled ? 'Enabled' : 'Disabled'}
            </UITypographyText>
          }
        />
      ),
    },
    {
      title: 'Last Run',
      dataIndex: 'lastRun',
      key: 'lastRun',
      render: (date?: Date | string) => (
        <UISpace className="gap-tight">
          <UIIcon name="CalendarOutlined" className="text-secondary" />
          <UITypographyText className="typo-caption">{formatDate(date)}</UITypographyText>
        </UISpace>
      ),
    },
    {
      title: 'Next Run',
      dataIndex: 'nextRun',
      key: 'nextRun',
      render: (date?: Date | string) => (
        date ? (
          <UISpace className="gap-tight">
            <UIIcon name="CalendarOutlined" className="text-info" />
            <UITypographyText className="typo-caption">{formatDate(date)}</UITypographyText>
          </UISpace>
        ) : (
          <UITypographyText className="typo-caption text-tertiary">—</UITypographyText>
        )
      ),
    },
    {
      title: 'Plugin',
      dataIndex: 'pluginId',
      key: 'pluginId',
      render: (pluginId?: string) => (
        pluginId ? (
          <UITag color="blue">{pluginId}</UITag>
        ) : (
          <UITypographyText className="typo-caption text-tertiary">—</UITypographyText>
        )
      ),
    },
  ];

  const enabledCount = cronsData?.crons?.filter((c) => c.enabled).length || 0;
  const disabledCount = cronsData?.crons?.filter((c) => !c.enabled).length || 0;

  return (
    <UISpace direction="vertical" className="gap-section" style={{ width: '100%' }}>
      <UICard>
        <UISpace className="gap-section">
          <div>
            <UITypographyText className="typo-label text-secondary">Total Cron Jobs</UITypographyText>
            <div>
              <UITypographyText className="typo-section-title">{cronsData?.crons?.length || 0}</UITypographyText>
            </div>
          </div>
          <div>
            <UITypographyText className="typo-label text-secondary">Enabled</UITypographyText>
            <div>
              <UITypographyText className="typo-section-title text-success">{enabledCount}</UITypographyText>
            </div>
          </div>
          <div>
            <UITypographyText className="typo-label text-secondary">Disabled</UITypographyText>
            <div>
              <UITypographyText className="typo-section-title">{disabledCount}</UITypographyText>
            </div>
          </div>
        </UISpace>
      </UICard>

      <UICard>
        <UITable
          dataSource={cronsData?.crons || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showTotal: (total) => (
              <UITypographyText className="typo-caption">Total {total} cron jobs</UITypographyText>
            ),
          }}
        />
      </UICard>
    </UISpace>
  );
}
