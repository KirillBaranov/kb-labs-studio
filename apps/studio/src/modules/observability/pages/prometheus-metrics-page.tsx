import { Row, Col, Table, Card, Statistic, Alert, Tag, Progress, Timeline, Badge } from 'antd';
import {
  ClockCircleOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { usePrometheusMetrics } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { PluginMetrics, TenantMetrics } from '@kb-labs/studio-data-client';

/**
 * Format uptime duration to human-readable string
 */
function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format number with optional decimal places
 */
function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

/**
 * Format timestamp to relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  return `${seconds}s ago`;
}

/**
 * Get status code color
 */
function getStatusCodeColor(code: number): string {
  if (code >= 500) return '#ff4d4f'; // red
  if (code >= 400) return '#faad14'; // orange
  if (code >= 300) return '#1890ff'; // blue
  return '#52c41a'; // green
}

/**
 * Prometheus Metrics Observability Page
 *
 * Shows real-time metrics from REST API /metrics/json endpoint:
 * - Request counts and error rates
 * - Latency percentiles (p50, p95, p99)
 * - Per-plugin and per-tenant breakdown
 * - Redis health status
 * - Plugin mount statistics
 */
export function PrometheusMetricsPage() {
  const sources = useDataSources();
  const { data, isLoading, error, isError } = usePrometheusMetrics(sources.observability);

  if (isError) {
    return (
      <KBPageContainer>
        <KBPageHeader
          title="Prometheus Metrics"
          description="REST API performance and health metrics"
        />
        <Alert
          message="Failed to load Prometheus metrics"
          description={error instanceof Error ? error.message : 'Unknown error. Make sure REST API is running on localhost:5050'}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      </KBPageContainer>
    );
  }

  if (isLoading || !data) {
    return (
      <KBPageContainer>
        <KBPageHeader
          title="Prometheus Metrics"
          description="REST API performance and health metrics"
        />
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          Loading...
        </div>
      </KBPageContainer>
    );
  }

  const errorRate = data.requests?.total > 0
    ? (((data.requests.clientErrors ?? 0) + (data.requests.serverErrors ?? 0)) / data.requests.total) * 100
    : 0;

  const successRate = data.requests?.total > 0
    ? ((data.requests.success ?? 0) / data.requests.total) * 100
    : 0;

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Prometheus Metrics"
        description="REST API performance metrics - Auto-refresh every 10s"
      />

      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Requests"
              value={data.requests?.total ?? 0}
              prefix={<ApiOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Latency (p50)"
              value={formatNumber(data.latency?.p50 ?? 0, 1)}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Error Rate"
              value={formatNumber(errorRate, 1)}
              suffix="%"
              prefix={<WarningOutlined />}
              valueStyle={{ color: errorRate > 5 ? '#ff4d4f' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Uptime"
              value={formatUptime(data.uptime?.seconds ?? 0)}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Latency Percentiles */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Latency Percentiles" extra={<ThunderboltOutlined style={{ color: '#1890ff' }} />}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="p50 (Median)"
                  value={formatNumber(data.latency?.p50 ?? 0, 1)}
                  suffix="ms"
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="p95"
                  value={formatNumber(data.latency?.p95 ?? 0, 1)}
                  suffix="ms"
                  valueStyle={{ fontSize: 20, color: (data.latency?.p95 ?? 0) > 200 ? '#faad14' : '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="p99"
                  value={formatNumber(data.latency?.p99 ?? 0, 1)}
                  suffix="ms"
                  valueStyle={{ fontSize: 20, color: (data.latency?.p99 ?? 0) > 500 ? '#ff4d4f' : '#faad14' }}
                />
              </Col>
            </Row>
            <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
              Min: {formatNumber(data.latency?.min ?? 0, 1)}ms | Max: {formatNumber(data.latency?.max ?? 0, 1)}ms | Avg: {formatNumber(data.latency?.average ?? 0, 1)}ms
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Success Rate" extra={<CheckCircleOutlined style={{ color: successRate >= 95 ? '#52c41a' : '#faad14' }} />}>
            <Progress
              percent={Math.round(successRate)}
              status={successRate >= 95 ? 'success' : successRate >= 90 ? 'normal' : 'exception'}
              strokeColor={successRate >= 95 ? '#52c41a' : successRate >= 90 ? '#1890ff' : '#ff4d4f'}
            />
            <div style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Success"
                    value={data.requests?.success ?? 0}
                    valueStyle={{ fontSize: 18, color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="4xx Errors"
                    value={data.requests?.clientErrors ?? 0}
                    valueStyle={{ fontSize: 18, color: '#faad14' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="5xx Errors"
                    value={data.requests?.serverErrors ?? 0}
                    valueStyle={{ fontSize: 18, color: '#ff4d4f' }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Per-Plugin Metrics */}
      <Card title="Per-Plugin Metrics" style={{ marginBottom: 24 }}>
        <Table<{ key: string; plugin: string } & PluginMetrics>
          dataSource={(data.perPlugin ?? []).map((item) => ({
            key: item.pluginId,
            plugin: item.pluginId,
            ...item,
          }))}
          columns={[
            {
              title: 'Plugin',
              dataIndex: 'plugin',
              key: 'plugin',
              render: (plugin: string) => <Tag color="blue">{plugin}</Tag>,
            },
            {
              title: 'Requests',
              dataIndex: 'requests',
              key: 'requests',
              align: 'right' as const,
              sorter: (a, b) => a.requests - b.requests,
            },
            {
              title: 'Errors',
              dataIndex: 'errors',
              key: 'errors',
              align: 'right' as const,
              render: (errors: number) => (
                <span style={{ color: errors > 10 ? '#ff4d4f' : errors > 0 ? '#faad14' : '#52c41a' }}>
                  {errors}
                </span>
              ),
            },
            {
              title: 'Avg Latency',
              key: 'avgLatency',
              align: 'right' as const,
              render: (_: unknown, record: PluginMetrics) =>
                record.latency ? `${formatNumber(record.latency.average, 1)} ms` : 'N/A',
              sorter: (a, b) => (a.latency?.average ?? 0) - (b.latency?.average ?? 0),
            },
            {
              title: 'Min / Max',
              key: 'minMax',
              align: 'right' as const,
              render: (_: unknown, record: PluginMetrics) =>
                record.latency ? (
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                    {formatNumber(record.latency.min, 1)} / {formatNumber(record.latency.max, 1)} ms
                  </span>
                ) : <span>N/A</span>,
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Per-Tenant Metrics */}
      <Card title="Per-Tenant Metrics" style={{ marginBottom: 24 }}>
        <Table<{ key: string; tenant: string } & TenantMetrics>
          dataSource={(data.perTenant ?? []).map((item) => ({
            key: item.tenantId,
            tenant: item.tenantId,
            ...item,
          }))}
          columns={[
            {
              title: 'Tenant',
              dataIndex: 'tenant',
              key: 'tenant',
              render: (tenant: string) => <Tag color="green">{tenant}</Tag>,
            },
            {
              title: 'Requests',
              dataIndex: 'requests',
              key: 'requests',
              align: 'right' as const,
            },
            {
              title: 'Errors',
              dataIndex: 'errors',
              key: 'errors',
              align: 'right' as const,
              render: (errors: number) => (
                <span style={{ color: errors > 50 ? '#ff4d4f' : errors > 10 ? '#faad14' : '#52c41a' }}>
                  {errors}
                </span>
              ),
            },
            {
              title: 'Avg Latency',
              key: 'avgLatency',
              align: 'right' as const,
              render: (_: unknown, record: TenantMetrics) =>
                record.latency ? `${formatNumber(record.latency.average, 1)} ms` : 'N/A',
            },
            {
              title: 'Error Rate',
              key: 'errorRate',
              align: 'right' as const,
              render: (_: unknown, record: TenantMetrics) => {
                const rate = record.requests > 0 ? (record.errors / record.requests) * 100 : 0;
                return (
                  <span style={{ color: rate > 5 ? '#ff4d4f' : rate > 2 ? '#faad14' : '#52c41a' }}>
                    {formatNumber(rate, 1)}%
                  </span>
                );
              },
            },
          ]}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Error Analytics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Error Breakdown" extra={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}>
            <Row gutter={16}>
              {Object.entries(data.errors?.byStatusCode ?? {})
                .sort(([a], [b]) => Number(b) - Number(a))
                .map(([code, count]) => (
                  <Col span={8} key={code}>
                    <Statistic
                      title={`${code} Errors`}
                      value={count}
                      valueStyle={{ fontSize: 18, color: getStatusCodeColor(Number(code)) }}
                    />
                  </Col>
                ))}
            </Row>
            {Object.keys(data.errors?.byStatusCode ?? {}).length === 0 && (
              <Alert message="No errors recorded" type="success" showIcon />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Errors" extra={<Badge count={data.errors?.recent?.length ?? 0} />}>
            {data.errors?.recent && data.errors.recent.length > 0 ? (
              <Timeline
                items={data.errors.recent.map((error) => ({
                  color: getStatusCodeColor(error.statusCode),
                  children: (
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <Tag color={getStatusCodeColor(error.statusCode)}>{error.statusCode}</Tag>
                        {error.errorCode && <Tag>{error.errorCode}</Tag>}
                        <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
                          {formatRelativeTime(error.timestamp)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13 }}>{error.message}</div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Alert message="No recent errors" type="success" showIcon />
            )}
          </Card>
        </Col>
      </Row>

      {/* Redis Status & Plugin Mounts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Redis Status" extra={<DatabaseOutlined style={{ color: data.redis.lastStatus?.healthy ? '#52c41a' : '#ff4d4f' }} />}>
            {data.redis.lastStatus ? (
              <>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Health"
                      value={data.redis.lastStatus.healthy ? 'Healthy' : 'Unhealthy'}
                      valueStyle={{ color: data.redis.lastStatus.healthy ? '#52c41a' : '#ff4d4f' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Role"
                      value={data.redis.lastStatus.role}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }}>
                    State: <strong>{data.redis.lastStatus.state}</strong>
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#8c8c8c' }}>
                    Healthy transitions: {data.redis.healthyTransitions} | Unhealthy: {data.redis.unhealthyTransitions}
                  </p>
                </div>
              </>
            ) : (
              <Alert message="No Redis status data available" type="info" showIcon />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Plugin Mounts">
            {data.pluginMounts ? (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Total"
                      value={data.pluginMounts.total}
                      valueStyle={{ fontSize: 20 }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Succeeded"
                      value={data.pluginMounts.succeeded}
                      valueStyle={{ fontSize: 20, color: '#52c41a' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Failed"
                      value={data.pluginMounts.failed}
                      valueStyle={{ fontSize: 20, color: data.pluginMounts.failed > 0 ? '#ff4d4f' : '#52c41a' }}
                    />
                  </Col>
                </Row>
                <div style={{ marginTop: 16, fontSize: 12, color: '#8c8c8c' }}>
                  Elapsed time: {formatNumber(data.pluginMounts.elapsedMs, 0)}ms
                </div>
              </>
            ) : (
              <Alert message="No plugin mount data available" type="info" showIcon />
            )}
          </Card>
        </Col>
      </Row>
    </KBPageContainer>
  );
}
