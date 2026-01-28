import { useEffect, useState } from 'react';
import { UICard } from '@kb-labs/studio-ui-kit';
import { Table } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { type MetricsSnapshot } from '../../../api/metrics';
import { useDataSources } from '../../../providers/data-sources-provider';

export function DashboardPluginsWidget() {
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

  const columns = [
    {
      title: 'Plugin',
      dataIndex: 'pluginId',
      key: 'pluginId',
      render: (text: string) => text || 'unknown',
    },
    {
      title: 'Requests',
      dataIndex: 'total',
      key: 'total',
      sorter: (a: any, b: any) => a.total - b.total,
      defaultSortOrder: 'descend' as const,
    },
    {
      title: 'Avg (ms)',
      dataIndex: 'avgDuration',
      key: 'avgDuration',
      render: (value: number) => value.toFixed(0),
    },
    {
      title: 'Max (ms)',
      dataIndex: 'maxDuration',
      key: 'maxDuration',
      render: (value: number) => value.toFixed(0),
    },
  ];

  const dataSource = metrics?.perPlugin?.map((plugin, index) => ({
    key: plugin.pluginId || `plugin-${index}`,
    pluginId: plugin.pluginId,
    total: plugin.total,
    avgDuration: plugin.total > 0 ? plugin.totalDuration / plugin.total : 0,
    maxDuration: plugin.maxDuration,
  })) ?? [];

  return (
    <UICard
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: 'var(--text-tertiary)' }} />
          <span>Plugin Performance</span>
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, padding: '16px', overflow: 'auto' }}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        size="small"
        scroll={{ y: 240 }}
      />
    </UICard>
  );
}
