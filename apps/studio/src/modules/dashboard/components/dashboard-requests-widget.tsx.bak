import { useEffect, useState } from 'react';
import { HolderOutlined } from '@ant-design/icons';
import { KBCard, KBLineChart } from '@kb-labs/studio-ui-react';
import { type MetricsSnapshot } from '../../../api/metrics';
import { useDataSources } from '../../../providers/data-sources-provider';
import { Spin } from 'antd';

export function DashboardRequestsWidget() {
  const { metrics: metricsSource } = useDataSources();
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await metricsSource.getMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Failed to load metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [metricsSource]);

  // Transform histogram data to chart format
  const chartData = metrics?.latency?.histogram
    ?.slice(0, 10) // Top 10 routes
    ?.map(item => ({
      route: item.route.replace(/^[A-Z]+\s/, ''), // Remove HTTP method
      requests: item.count,
    })) ?? [];

  const config = {
    data: chartData,
    xField: 'route',
    yField: 'requests',
    smooth: true,
    height: 250,
    autoFit: true,
    point: {
      size: 5,
      shape: 'circle',
    },
    tooltip: {
      showCrosshairs: true,
      shared: true,
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  return (
    <KBCard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: '#999' }} />
          <span>Top Routes</span>
          {loading && <Spin size="small" />}
        </div>
      }
      style={{ height: '100%' }}
    >
      {chartData.length > 0 ? (
        <KBLineChart {...config} />
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          No request data available
        </div>
      )}
    </KBCard>
  );
}
