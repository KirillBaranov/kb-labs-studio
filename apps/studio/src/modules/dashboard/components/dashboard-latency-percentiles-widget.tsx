import { useEffect, useState } from 'react';
import { Card } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { type MetricsSnapshot } from '../../../api/metrics';
import { useDataSources } from '../../../providers/data-sources-provider';

export function DashboardLatencyPercentilesWidget() {
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
    const interval = setInterval(loadMetrics, 10000); // Refresh every 10s (less frequent)

    return () => clearInterval(interval);
  }, [metricsSource]);

  const min = metrics?.latency?.min ?? 0;
  const average = metrics?.latency?.average ?? 0;
  const p50 = metrics?.latency?.p50 ?? 0;
  const p95 = metrics?.latency?.p95 ?? 0;
  const p99 = metrics?.latency?.p99 ?? 0;
  const max = metrics?.latency?.max ?? 0;

  const chartData = [
    { metric: 'Min', value: min, color: '#52c41a' },
    { metric: 'Avg', value: average, color: '#1890ff' },
    { metric: 'p50', value: p50, color: '#13c2c2' },
    { metric: 'p95', value: p95, color: '#faad14' },
    { metric: 'p99', value: p99, color: '#ff7a45' },
    { metric: 'Max', value: max, color: '#f5222d' },
  ];

  const config = {
    data: chartData,
    xField: 'metric',
    yField: 'value',
    seriesField: 'metric',
    columnStyle: (datum: any) => {
      return {
        fill: datum.color,
      };
    },
    label: {
      position: 'top' as const,
      formatter: (datum: any) => `${datum.value.toFixed(1)}ms`,
      style: {
        fontSize: 12,
        fill: '#666',
      },
    },
    xAxis: {
      label: {
        style: {
          fontSize: 12,
          fill: '#666',
        },
      },
    },
    yAxis: {
      label: {
        formatter: (v: string) => `${v}ms`,
        style: {
          fontSize: 12,
          fill: '#666',
        },
      },
    },
    legend: false,
    height: 280,
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: '#999' }} />
          <span>Latency Distribution (ms)</span>
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column' }}
    >
      {metrics && <Column {...config} />}
      {!metrics && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          Loading...
        </div>
      )}
    </Card>
  );
}
