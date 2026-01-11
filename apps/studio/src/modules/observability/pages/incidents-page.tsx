import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Alert,
  Badge,
  Tag,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Button,
  Space,
  Tooltip,
  message,
} from 'antd';
import {
  FireOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import type {
  Incident,
  IncidentQuery,
  IncidentSeverity,
  IncidentType,
  IncidentsListResponse,
} from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

/**
 * Format timestamp to human-readable string
 */
function formatTime(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * Format duration between timestamps
 */
function formatDuration(from: number, to: number): string {
  const durationMs = to - from;
  const minutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

/**
 * Get severity icon and color
 */
function getSeverityConfig(severity: IncidentSeverity): { icon: React.ReactElement; color: string } {
  switch (severity) {
    case 'critical':
      return { icon: <FireOutlined />, color: '#ff4d4f' };
    case 'warning':
      return { icon: <WarningOutlined />, color: '#faad14' };
    case 'info':
      return { icon: <InfoCircleOutlined />, color: '#1890ff' };
  }
}

/**
 * Get incident type label
 */
function getTypeLabel(type: IncidentType): string {
  switch (type) {
    case 'error_rate':
      return 'Error Rate';
    case 'latency_spike':
      return 'Latency Spike';
    case 'plugin_failure':
      return 'Plugin Failure';
    case 'adapter_failure':
      return 'Adapter Failure';
    case 'system_health':
      return 'System Health';
    case 'custom':
      return 'Custom';
  }
}

/**
 * Incidents Management Page
 *
 * Shows all incidents with filters and summary statistics
 */
export function IncidentsPage() {
  const navigate = useNavigate();
  const sources = useDataSources();
  const [filters, setFilters] = useState<IncidentQuery>({
    limit: 50,
    includeResolved: false,
  });

  // Fetch incidents list
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<IncidentsListResponse>({
    queryKey: ['incidents', 'list', filters],
    queryFn: async () => {
      return sources.observability.listIncidents(filters);
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  const incidents = data?.data?.incidents ?? [];
  const summary = data?.data?.summary;

  // Handle filter changes
  const handleSeverityChange = (value: IncidentSeverity | undefined) => {
    setFilters({ ...filters, severity: value });
  };

  const handleTypeChange = (value: IncidentType | undefined) => {
    setFilters({ ...filters, type: value });
  };

  const handleIncludeResolvedChange = (value: boolean) => {
    setFilters({ ...filters, includeResolved: value });
  };

  const handleViewIncident = (id: string) => {
    navigate(`/observability/incidents/${id}`);
  };

  // Table columns
  const columns = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: IncidentSeverity) => {
        const config = getSeverityConfig(severity);
        return (
          <Tooltip title={severity.toUpperCase()}>
            <Tag color={config.color} icon={config.icon}>
              {severity.toUpperCase()}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: IncidentType) => (
        <Tag>{getTypeLabel(type)}</Tag>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <strong>{title}</strong>,
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: number) => (
        <Tooltip title={formatTime(timestamp)}>
          <span>{dayjs(timestamp).fromNow()}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      width: 120,
      render: (resolvedAt: number | undefined, record: Incident) => {
        if (resolvedAt) {
          const duration = formatDuration(record.timestamp, resolvedAt);
          return (
            <Tooltip title={`Resolved in ${duration}`}>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                RESOLVED
              </Tag>
            </Tooltip>
          );
        }
        return (
          <Tooltip title="Incident is still active">
            <Tag color="error" icon={<ClockCircleOutlined />}>
              ACTIVE
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'AI Analysis',
      dataIndex: 'aiAnalysis',
      key: 'aiAnalysis',
      width: 100,
      align: 'center' as const,
      render: (aiAnalysis: any) => {
        if (aiAnalysis) {
          return <Badge status="success" text="Yes" />;
        }
        return <Badge status="default" text="No" />;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Incident) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewIncident(record.id)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Incidents"
        description="System incident history with AI-powered analysis"
        extra={[
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>,
        ]}
      />

      {error && (
        <Alert
          message="Failed to load incidents"
          description={(error as Error).message}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Summary Statistics */}
      {summary && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Incidents"
                value={summary.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Unresolved"
                value={summary.unresolved}
                valueStyle={{ color: summary.unresolved > 0 ? '#ff4d4f' : '#52c41a' }}
                suffix={summary.unresolved > 0 ? <FireOutlined /> : <CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={4}>
            <Card>
              <Statistic
                title="Critical"
                value={summary.bySeverity.critical}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={4}>
            <Card>
              <Statistic
                title="Warning"
                value={summary.bySeverity.warning}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={4}>
            <Card>
              <Statistic
                title="Info"
                value={summary.bySeverity.info}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <span>Filters:</span>
          <Select
            style={{ width: 140 }}
            placeholder="Severity"
            allowClear
            value={filters.severity}
            onChange={handleSeverityChange}
            options={[
              { label: 'Critical', value: 'critical' },
              { label: 'Warning', value: 'warning' },
              { label: 'Info', value: 'info' },
            ]}
          />
          <Select
            style={{ width: 160 }}
            placeholder="Type"
            allowClear
            value={filters.type}
            onChange={handleTypeChange}
            options={[
              { label: 'Error Rate', value: 'error_rate' },
              { label: 'Latency Spike', value: 'latency_spike' },
              { label: 'Plugin Failure', value: 'plugin_failure' },
              { label: 'Adapter Failure', value: 'adapter_failure' },
              { label: 'System Health', value: 'system_health' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
          <Select
            style={{ width: 180 }}
            value={filters.includeResolved ?? false}
            onChange={handleIncludeResolvedChange}
            options={[
              { label: 'Active Only', value: false },
              { label: 'Include Resolved', value: true },
            ]}
          />
        </Space>
      </Card>

      {/* Incidents Table */}
      <Card>
        <Table
          dataSource={incidents}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} incidents`,
          }}
        />
      </Card>
    </KBPageContainer>
  );
}
