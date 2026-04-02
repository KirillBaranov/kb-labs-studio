/**
 * @module @kb-labs/studio-app/modules/workflows/pages/workflows-runs-page
 * All workflow runs list with filters
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UITable,
  UIButton,
  UISelect,
  UIRow,
  UICol,
  UIIcon,
  UITypographyText,
} from '@kb-labs/studio-ui-kit';
import type { UITableColumn } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useWorkflowRuns } from '@kb-labs/studio-data-client';
import type { WorkflowRun } from '@kb-labs/studio-data-client';
import { WorkflowStatusBadge } from '@/components/workflow-status-badge';
import { UIPage, UIPageHeader, UIPageSection } from '@kb-labs/studio-ui-kit';
import { UICard } from '@kb-labs/studio-ui-kit';

export function WorkflowsRunsPage() {
  const sources = useDataSources();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{ limit: number; status?: string }>({ limit: 50 });
  const queryFilters = useMemo(() => ({ limit: filters.limit }), [filters.limit]);
  const { data, isLoading, refetch } = useWorkflowRuns(sources.workflow, queryFilters);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) {return '-';}
    return new Date(dateStr).toLocaleString();
  };

  const formatDuration = (run: WorkflowRun) => {
    if (!run.startedAt) {return '-';}
    const start = new Date(run.startedAt).getTime();
    const end = run.finishedAt ? new Date(run.finishedAt).getTime() : Date.now();
    const ms = end - start;
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {return `${seconds}s`;}
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {return `${minutes}m ${seconds % 60}s`;}
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const columns = useMemo<UITableColumn<WorkflowRun>[]>(
    () => [
      {
        title: 'Run ID',
        dataIndex: 'id',
        key: 'id',
        width: 180,
        render: (value: string) => (
          <UITypographyText className="typo-caption" code ellipsis={{ tooltip: value }}>
            {value.slice(0, 16)}...
          </UITypographyText>
        ),
      },
      {
        title: 'Workflow',
        dataIndex: 'name',
        key: 'name',
        width: 220,
        render: (_value, record) => (
          <UITypographyText className="typo-body" strong>
            {record.name}@{record.version}
          </UITypographyText>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: WorkflowRun['status']) => <WorkflowStatusBadge status={status} />,
      },
      {
        title: 'Triggered By',
        key: 'actor',
        width: 140,
        render: (_value, record) => (
          <UITypographyText className="typo-caption text-secondary">
            {record.trigger.actor ?? 'unknown'}
          </UITypographyText>
        ),
      },
      {
        title: 'Started At',
        dataIndex: 'startedAt',
        key: 'startedAt',
        width: 180,
        render: (val: string) => (
          <UITypographyText className="typo-caption">{formatDate(val)}</UITypographyText>
        ),
      },
      {
        title: 'Duration',
        key: 'duration',
        width: 100,
        render: (_value, record) => (
          <UITypographyText className="typo-caption">{formatDuration(record)}</UITypographyText>
        ),
      },
    ],
    [],
  );

  return (
    <UIPage width="full">
      <UIPageHeader
        title="Workflow Runs"
        description="All workflow executions"
        icon={<UIIcon name="PlayCircleOutlined" />}
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Workflows', href: '/workflows' },
          { title: 'Runs' },
        ]}
        extra={
          <UIButton onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </UIButton>
        }
      />

      <UICard style={{ marginBottom: 'var(--spacing-section)' }}>
        <UIRow gutter={16}>
          <UICol span={8}>
            <UITypographyText className="typo-label">Filter by Status</UITypographyText>
            <UISelect
              style={{ width: '100%', marginTop: 8 }}
              placeholder="All statuses"
              allowClear
              value={filters.status}
              onChange={(status) => setFilters({ ...filters, status: status as string | undefined })}
              options={[
                { label: 'Running', value: 'running' },
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Queued', value: 'queued' },
              ]}
            />
          </UICol>
          <UICol span={8}>
            <UITypographyText className="typo-label">Limit</UITypographyText>
            <UISelect
              style={{ width: '100%', marginTop: 8 }}
              value={filters.limit}
              onChange={(limit) => setFilters({ ...filters, limit: limit as number })}
              options={[
                { label: '25', value: 25 },
                { label: '50', value: 50 },
                { label: '100', value: 100 },
                { label: '200', value: 200 },
              ]}
            />
          </UICol>
        </UIRow>
      </UICard>

      <UICard>
        <UITable
          rowKey="id"
          columns={columns}
          dataSource={data?.runs ?? []}
          loading={isLoading}
          scroll={{ x: 960 }}
          pagination={{ pageSize: 20 }}
          onRow={(record) => ({
            style: { cursor: 'pointer' },
            onClick: () => navigate(`/workflows/runs/${record.id}`),
          })}
        />
      </UICard>
    </UIPage>
  );
}
