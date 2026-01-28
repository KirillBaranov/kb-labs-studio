import { useEffect, useState } from 'react';
import { UICard } from '@kb-labs/studio-ui-kit';
import { Row, Col } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { KBStatCard } from '@kb-labs/studio-ui-react';
import { type MetricsSnapshot } from '../../../api/metrics';
import { useDataSources } from '../../../providers/data-sources-provider';

export function DashboardMetricsWidget() {
  const { metrics: metricsSource } = useDataSources();
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await metricsSource.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [metricsSource]);

  const totalRequests = metrics?.requests?.total ?? 0;
  const totalErrors = metrics?.errors?.total ?? 0;
  const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  const avgLatency = metrics?.latency?.average ?? 0;
  const p50 = metrics?.latency?.p50 ?? 0;
  const p95 = metrics?.latency?.p95 ?? 0;
  const p99 = metrics?.latency?.p99 ?? 0;
  const uptime = metrics?.uptime?.seconds ?? 0;

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <UICard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: 'var(--text-tertiary)' }} />
          <span>Performance Metrics</span>
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, padding: '16px' }}
    >
      <Row gutter={[16, 16]} style={{ height: '100%' }}>
        <Col span={6}>
          <KBStatCard
            label="Requests"
            value={totalRequests.toLocaleString()}
            valueColor="var(--info)"
          />
        </Col>
        <Col span={6}>
          <KBStatCard
            label="Error Rate"
            value={`${errorRate.toFixed(1)}%`}
            valueColor={errorRate > 5 ? 'var(--error)' : errorRate > 1 ? 'var(--warning)' : 'var(--success)'}
          />
        </Col>
        <Col span={6}>
          <KBStatCard
            label="Latency (avg)"
            value={`${avgLatency.toFixed(1)}ms`}
            subValue={`p50 ${p50.toFixed(1)}ms`}
            valueColor={avgLatency > 500 ? 'var(--error)' : avgLatency > 200 ? 'var(--warning)' : 'var(--success)'}
          />
        </Col>
        <Col span={6}>
          <KBStatCard
            label="Latency (p95/p99)"
            value={`${p95.toFixed(1)}ms`}
            subValue={`p99 ${p99.toFixed(1)}ms`}
            valueColor={p95 > 1000 ? 'var(--error)' : p95 > 500 ? 'var(--warning)' : 'var(--success)'}
          />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={6}>
          <KBStatCard
            label="Uptime"
            value={formatUptime(uptime)}
            valueColor="var(--success)"
          />
        </Col>
      </Row>
    </UICard>
  );
}
