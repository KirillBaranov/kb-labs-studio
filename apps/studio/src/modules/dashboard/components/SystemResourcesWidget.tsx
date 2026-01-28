import React, { useState } from 'react';
import { Tabs, Progress, Statistic, Row, Col, Tag, Empty } from 'antd';
import {
  CloudServerOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { UICard } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '../../../providers/data-sources-provider';
import { useSystemMetrics, type SystemMetricsData } from '@kb-labs/studio-data-client';

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) {return '0 B';}
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format uptime to human-readable string
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Get color for metric value based on thresholds
 */
function getMetricColor(value: number, warningThreshold: number, criticalThreshold: number): string {
  if (value >= criticalThreshold) {return 'var(--error)';}
  if (value >= warningThreshold) {return 'var(--warning)';}
  return 'var(--success)';
}

/**
 * Instance metrics card
 */
function InstanceMetrics({ instance }: { instance: SystemMetricsData['instances'][0] }) {
  const now = Date.now();
  const age = now - instance.timestamp;
  const isStale = age >= 30000; // 30 seconds
  const isDead = age >= 60000; // 60 seconds

  const cpuColor = getMetricColor(instance.cpu.percentage, 70, 90);
  const memoryColor = getMetricColor(instance.memory.rssPercentage, 80, 95);
  const heapColor = getMetricColor(instance.memory.heapPercentage, 85, 95);

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Instance header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <CloudServerOutlined style={{ fontSize: 18, color: isDead ? 'var(--text-tertiary)' : 'var(--info)' }} />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{instance.instanceId}</span>
        {isDead && <Tag color="red">Dead</Tag>}
        {isStale && !isDead && <Tag color="orange">Stale</Tag>}
        {!isStale && <Tag color="green">Active</Tag>}
      </div>

      {/* Metrics grid */}
      <Row gutter={[16, 16]}>
        {/* CPU */}
        <Col span={12}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <ThunderboltOutlined style={{ color: cpuColor }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>CPU Usage</span>
            </div>
            <Progress
              percent={parseFloat(instance.cpu.percentage.toFixed(1))}
              strokeColor={cpuColor}
              size="small"
              format={(percent) => `${percent}%`}
            />
          </div>
        </Col>

        {/* Memory (RSS) */}
        <Col span={12}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <DatabaseOutlined style={{ color: memoryColor }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Memory (RSS)</span>
            </div>
            <Progress
              percent={parseFloat(instance.memory.rssPercentage.toFixed(1))}
              strokeColor={memoryColor}
              size="small"
              format={(percent) => `${percent}%`}
            />
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {formatBytes(instance.memory.rss)} / {formatBytes(instance.totalMemory)}
            </div>
          </div>
        </Col>

        {/* Heap */}
        <Col span={12}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <DatabaseOutlined style={{ color: heapColor }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Heap Usage</span>
            </div>
            <Progress
              percent={parseFloat(instance.memory.heapPercentage.toFixed(1))}
              strokeColor={heapColor}
              size="small"
              format={(percent) => `${percent}%`}
            />
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
              {formatBytes(instance.memory.heapUsed)} / {formatBytes(instance.memory.heapTotal)}
            </div>
          </div>
        </Col>

        {/* Uptime */}
        <Col span={12}>
          <Statistic
            title={
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Uptime
              </span>
            }
            value={formatUptime(instance.uptime)}
            valueStyle={{ fontSize: 14 }}
          />
        </Col>

        {/* Load Average */}
        <Col span={24}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Load Average</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>1m:</span>{' '}
              <span style={{ fontWeight: 500 }}>{instance.loadAvg[0].toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>5m:</span>{' '}
              <span style={{ fontWeight: 500 }}>{instance.loadAvg[1].toFixed(2)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-tertiary)' }}>15m:</span>{' '}
              <span style={{ fontWeight: 500 }}>{instance.loadAvg[2].toFixed(2)}</span>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

/**
 * System Resources Widget - displays CPU, memory, and uptime metrics from REST API instances
 */
export function SystemResourcesWidget() {
  const sources = useDataSources();
  const [activeInstanceTab, setActiveInstanceTab] = useState<string>('0');

  // Fetch system metrics from backend
  const metricsQuery = useSystemMetrics(sources.observability);

  const isLoading = metricsQuery.isLoading;
  const hasError = metricsQuery.isError;
  const data = metricsQuery.data;

  // Build tabs for each instance
  const instanceTabs = data?.instances.map((instance, index) => {
    const now = Date.now();
    const age = now - instance.timestamp;
    const isDead = age >= 60000;
    const isStale = age >= 30000 && age < 60000;

    return {
      key: String(index),
      label: (
        <span>
          Instance #{index + 1}
          {isDead && <Tag color="red" style={{ marginLeft: 4 }}>Dead</Tag>}
          {isStale && <Tag color="orange" style={{ marginLeft: 4 }}>Stale</Tag>}
        </span>
      ),
      children: <InstanceMetrics instance={instance} />,
      disabled: isDead, // Disable tab for dead instances
    };
  });

  return (
    <UICard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CloudServerOutlined />
          <span>System Resources</span>
          {data && data.summary.activeInstances > 0 && (
            <Tag color="green">
              {data.summary.activeInstances} Active
            </Tag>
          )}
        </div>
      }
      style={{ height: '100%' }}
    >
      {isLoading ? (
        <div style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-tertiary)',
        }}>
          Loading system metrics...
        </div>
      ) : hasError ? (
        <div style={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--error)',
        }}>
          Failed to load system metrics
        </div>
      ) : !data || data.instances.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No instances found"
          style={{ marginTop: 40 }}
        />
      ) : (
        <>
          {/* Summary stats */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic
                title="Avg CPU"
                value={data.summary.avgCpu}
                suffix="%"
                valueStyle={{
                  color: getMetricColor(data.summary.avgCpu, 70, 90),
                  fontSize: 20,
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Avg Memory"
                value={data.summary.avgMemory}
                suffix="%"
                valueStyle={{
                  color: getMetricColor(data.summary.avgMemory, 80, 95),
                  fontSize: 20,
                }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Avg Heap"
                value={data.summary.avgHeap}
                suffix="%"
                valueStyle={{
                  color: getMetricColor(data.summary.avgHeap, 85, 95),
                  fontSize: 20,
                }}
              />
            </Col>
          </Row>

          {/* Instance tabs */}
          {instanceTabs && instanceTabs.length > 1 ? (
            <Tabs
              activeKey={activeInstanceTab}
              onChange={setActiveInstanceTab}
              items={instanceTabs}
              size="small"
            />
          ) : (
            // Single instance - show directly without tabs
            instanceTabs && instanceTabs.length === 1 && (
              <InstanceMetrics instance={data.instances[0]} />
            )
          )}
        </>
      )}
    </UICard>
  );
}
