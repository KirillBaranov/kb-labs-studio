/**
 * @module @kb-labs/studio-app/modules/workflow/components/jobs-tab
 * Background jobs list view with filters and status
 */

import * as React from 'react';
import { Table, Tag, Space, Typography, Select, Row, Col } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useDataSources } from '@/providers/data-sources-provider';
import { KBCard } from '@kb-labs/studio-ui-react';
import type { JobStatusInfo, JobListFilter } from '@kb-labs/workflow-contracts';

const { Text } = Typography;

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
    if (!date) return '—';
    return new Date(date).toLocaleString();
  };

  const formatDuration = (start?: Date | string, end?: Date | string) => {
    if (!start) return '—';
    const startMs = new Date(start).getTime();
    const endMs = end ? new Date(end).getTime() : Date.now();
    const durationMs = endMs - startMs;
    const seconds = Math.floor(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const columns = [
    {
      title: 'Job ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => (
        <Text className="typo-caption" code>{id.slice(0, 12)}...</Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Text className="typo-body">{type}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: JobStatusInfo) => (
        <Space direction="vertical" className="gap-tight">
          <Tag color={STATUS_COLORS[status] || 'default'}>
            {status.toUpperCase()}
          </Tag>
          {record.progress !== undefined && status === 'running' && (
            <Text className="typo-caption text-secondary">
              {record.progress}%
              {record.progressMessage && ` - ${record.progressMessage}`}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date | string | undefined) => (
        <Space className="gap-tight">
          <ClockCircleOutlined className="text-secondary" />
          <Text className="typo-caption">{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: unknown, record: JobStatusInfo) => (
        <Text className="typo-caption">
          {formatDuration(record.startedAt, record.finishedAt)}
        </Text>
      ),
    },
    {
      title: 'Attempts',
      key: 'attempts',
      render: (_: unknown, record: JobStatusInfo) => (
        <Text className="typo-caption">
          {record.attempt || 0} / {record.maxRetries || 3}
        </Text>
      ),
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error?: string) => (
        error ? (
          <Text className="typo-caption text-error" ellipsis={{ tooltip: error }}>
            {error}
          </Text>
        ) : (
          <Text className="typo-caption text-tertiary">—</Text>
        )
      ),
    },
  ];

  return (
    <Space direction="vertical" className="gap-section" style={{ width: '100%' }}>
      <KBCard>
        <Row gutter={16}>
          <Col span={8}>
            <Text className="typo-label">Filter by Status</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="All statuses"
              allowClear
              value={filters.status}
              onChange={(status) => setFilters({ ...filters, status })}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Running', value: 'running' },
                { label: 'Completed', value: 'completed' },
                { label: 'Failed', value: 'failed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
          </Col>
          <Col span={8}>
            <Text className="typo-label">Filter by Type</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              placeholder="All types"
              allowClear
              showSearch
              value={filters.type}
              onChange={(type) => setFilters({ ...filters, type })}
            />
          </Col>
          <Col span={8}>
            <Text className="typo-label">Limit</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={filters.limit || 50}
              onChange={(limit) => setFilters({ ...filters, limit })}
              options={[
                { label: '25', value: 25 },
                { label: '50', value: 50 },
                { label: '100', value: 100 },
                { label: '200', value: 200 },
              ]}
            />
          </Col>
        </Row>
      </KBCard>

      <KBCard>
        <Table
          dataSource={jobsData?.jobs || []}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: filters.limit || 50,
            showTotal: (total) => (
              <Text className="typo-caption">Total {total} jobs</Text>
            ),
          }}
        />
      </KBCard>
    </Space>
  );
}
