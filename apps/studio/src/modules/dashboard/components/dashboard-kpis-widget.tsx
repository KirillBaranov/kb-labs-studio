import { Card, Row, Col, Badge } from 'antd';
import { HolderOutlined } from '@ant-design/icons';
import { KBStatCard } from '@kb-labs/studio-ui-react';
import { useRegistry } from '../../../providers/registry-provider';

export function DashboardKpisWidget() {
  const { health, registry } = useRegistry();

  const totalPlugins = registry.plugins?.length ?? 0;
  const pluginsMounted = health?.pluginsMounted ?? 0;
  const pluginsFailed = health?.pluginsFailed ?? 0;
  const systemStatus = health?.ready ? 'Healthy' : 'Degraded';
  const statusType = health?.ready ? 'success' : 'error';

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HolderOutlined className="drag-handle" style={{ cursor: 'grab', color: '#999' }} />
          <span>System Status</span>
          <Badge status={statusType as 'success' | 'error'} />
        </div>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      bodyStyle={{ flex: 1, padding: '16px' }}
    >
      <Row gutter={[16, 16]} style={{ height: '100%' }}>
        <Col span={6}>
          <KBStatCard
            label="Status"
            value={systemStatus}
            valueColor={health?.ready ? '#52c41a' : '#ff4d4f'}
          />
        </Col>
        <Col span={6}>
          <KBStatCard
            label="Plugins Mounted"
            value={pluginsMounted.toString()}
            subValue={`of ${totalPlugins}`}
          />
        </Col>
        <Col span={6}>
          <KBStatCard
            label="Failed"
            value={pluginsFailed.toString()}
            valueColor={pluginsFailed > 0 ? '#ff4d4f' : '#52c41a'}
          />
        </Col>
        <Col span={6}>
          <KBStatCard
            label="Redis"
            value={health?.redisHealthy ? 'Healthy' : health?.redisEnabled ? 'Unhealthy' : 'Disabled'}
            valueColor={health?.redisHealthy ? '#52c41a' : health?.redisEnabled ? '#ff4d4f' : '#999'}
          />
        </Col>
      </Row>
    </Card>
  );
}
