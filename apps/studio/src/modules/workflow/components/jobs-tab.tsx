/**
 * @module @kb-labs/studio-app/modules/workflow/components/jobs-tab
 * Background jobs list view with filters and status
 */

import * as React from 'react';
import {
  UITable,
  UITag,
  UISpace,
  UITypographyText,
  UISelect,
  UIRow,
  UICol,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import type { JobStatusInfo, JobListFilter } from '@kb-labs/workflow-contracts';
import { UICard } from '@kb-labs/studio-ui-kit';

const STATUS_COLORS: Record<string, string> = {
  pending: 'default',
  running: 'processing',
  completed: 'success',
  failed: 'error',
  cancelled: 'warning',
};

export function JobsTab() {
  const sources = useDataSources();
  const [filters, setFilters] = React.useState<JobListFilter>({ limit: 50 });

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['workflow', 'jobs', filters],
    queryFn: () => sources.workflow.listJobs(filters),
  });

  const formatDate = (date?: Date | string) => {
    if (!date) {return '—';}
    return new Date(date).toLocaleString();
  };

  const formatDuration = (start?: Date | string, end?: Date | string) => {
    if (!start) {return '—';}
    const startMs = new Date(start).getTime();
    const endMs = end ? new Date(end).getTime() : Date.now();
    const durationMs = endMs - startMs;
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) {return `${seconds}s`;}
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {return `${minutes}m ${seconds % 60}s`;}
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <UITypographyText className="typo-caption" code>{id.slice(0, 12)}...</UITypographyText>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <UITypographyText className="typo-body">{type}</UITypographyText>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: JobStatusInfo) => (
        <UISpace direction="vertical" className="gap-tight">
          <UITag color={STATUS_COLORS[status] || 'default'}>
            {status.toUpperCase()}
          </UITag>
          {record.progress !== undefined && status === 'running' && (
            <UITypographyText className="typo-caption text-secondary">
              {record.progress}%
              {record.progressMessage && ` - ${record.progressMessage}`}
            </UITypographyText>
          )}
        </UISpace>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date | string | undefined) => (
        <UISpace className="gap-tight">
          <UIIcon name="ClockCircleOutlined" className="text-secondary" />
          <UITypographyText className="typo-caption">{formatDate(date)}</UITypographyText>
        </UISpace>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: unknown, record: JobStatusInfo) => (
        <UITypographyText className="typo-caption">
          {formatDuration(record.startedAt, record.finishedAt)}
        </UITypographyText>
      ),
    },
    {
      title: 'Attempts',
      key: 'attempts',
      render: (_: unknown, record: JobStatusInfo) => (
        <UITypographyText className="typo-caption">
          {record.attempt || 0} / {record.maxRetries || 3}
        </UITypographyText>
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
      <UICard>
        <UIRow gutter={16}>
          <UICol span={8}>
            <UITypographyText className="typo-label">Filter by Status</UITypographyText>
            <UISelect
              style={{ width: '100%', marginTop: 8 }}
              placeholder="All statuses"
              allowClear
              value={filters.status}
              onChange={(status) => setFilters({ ...filters, status: status as typeof filters.status })}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Running', value: 'running' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
          </UICol>
          <UICol span={8}>
            <UITypographyText className="typo-label">Filter by Type</UITypographyText>
            <UISelect
              style={{ width: '100%', marginTop: 8 }}
              placeholder="All types"
              allowClear
              showSearch
              value={filters.type}
              onChange={(type) => setFilters({ ...filters, type: type as string | undefined })}
              options={[]}
            />
          </UICol>
          <UICol span={8}>
            <UITypographyText className="typo-label">Limit</UITypographyText>
            <UISelect
              style={{ width: '100%', marginTop: 8 }}
              value={filters.limit || 50}
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
          dataSource={jobsData?.jobs || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: filters.limit || 50,
          }}
        />
      </UICard>
    </UISpace>
  );
}
