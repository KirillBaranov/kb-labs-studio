import { Card, Alert, Badge, Tag, Timeline, Row, Col, Statistic } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DatabaseOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useSystemEvents } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { SystemEvent, RegistryEvent, HealthEvent } from '@kb-labs/studio-data-client';

/**
 * Format timestamp to time string
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * System Events Live Feed Page
 *
 * Shows real-time system events from /events/registry SSE stream:
 * - Registry updates (plugin registration, checksums)
 * - Health status changes
 * - Redis state transitions
 * - Plugin mount events
 */
export function SystemEventsPage() {
  const sources = useDataSources();
  const { events, isConnected, error } = useSystemEvents(sources.observability);

  const latestHealth = events.find((e) => e.type === 'health') as HealthEvent | undefined;
  const latestRegistry = events.find((e) => e.type === 'registry') as RegistryEvent | undefined;

  return (
    <KBPageContainer>
      <KBPageHeader
        title="System Events"
        description="Real-time system event stream - Auto-updates via Server-Sent Events"
      />

      {/* Connection Status */}
      {!isConnected && !error && (
        <Alert
          message="Connecting to event stream..."
          type="info"
          showIcon
          icon={<SyncOutlined spin />}
          style={{ marginBottom: 24 }}
        />
      )}

      {error && (
        <Alert
          message="Connection failed"
          description={error.message + ' - Make sure REST API is running on localhost:5050'}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {isConnected && (
        <Alert
          message="Connected to event stream"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Current System Status */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title="Latest Health Status"
            extra={
              latestHealth ? (
                <Badge
                  status={latestHealth.ready ? 'success' : 'error'}
                  text={latestHealth.ready ? 'Ready' : 'Not Ready'}
                />
              ) : null
            }
          >
            {latestHealth ? (
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Status"
                    value={latestHealth.status}
                    valueStyle={{ color: latestHealth.status === 'healthy' ? '#52c41a' : '#ff4d4f' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Plugins Mounted"
                    value={latestHealth.pluginsMounted ?? 0}
                    suffix={latestHealth.pluginsMounted !== undefined && latestHealth.pluginsFailed !== undefined
                      ? `/ ${latestHealth.pluginsMounted + latestHealth.pluginsFailed}`
                      : ''}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Redis"
                    value={latestHealth.redisEnabled
                      ? (latestHealth.redisHealthy ? 'Healthy' : 'Unhealthy')
                      : 'Disabled'}
                    valueStyle={{
                      color: !latestHealth.redisEnabled
                        ? '#8c8c8c'
                        : (latestHealth.redisHealthy ? '#52c41a' : '#ff4d4f')
                    }}
                  />
                </Col>
              </Row>
            ) : (
              <Alert message="No health data received yet" type="info" showIcon />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Latest Registry"
            extra={
              latestRegistry ? (
                <Tag color={latestRegistry.stale ? 'orange' : 'green'}>
                  {latestRegistry.stale ? 'Stale' : 'Fresh'}
                </Tag>
              ) : null
            }
          >
            {latestRegistry ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Revision"
                    value={String(latestRegistry.rev).substring(0, 8)}
                    valueStyle={{ fontSize: 18 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Generated"
                    value={formatTime(latestRegistry.generatedAt)}
                    valueStyle={{ fontSize: 18 }}
                  />
                </Col>
              </Row>
            ) : (
              <Alert message="No registry data received yet" type="info" showIcon />
            )}
          </Card>
        </Col>
      </Row>

      {/* Event Timeline */}
      <Card
        title="Live Event Feed"
        extra={
          <Badge
            count={events.length}
            overflowCount={99}
            style={{ backgroundColor: '#1890ff' }}
          />
        }
      >
        {events.length > 0 ? (
          <Timeline
            items={events.map((event, index) => {
              if (event.type === 'health') {
                const healthEvent = event as HealthEvent;
                return {
                  key: index,
                  color: healthEvent.ready ? 'green' : 'red',
                  dot: healthEvent.ready ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
                  children: (
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <Tag color="blue">HEALTH</Tag>
                        <Tag color={healthEvent.status === 'healthy' ? 'green' : 'red'}>
                          {healthEvent.status}
                        </Tag>
                        {healthEvent.ready && <Tag color="green">READY</Tag>}
                        {!healthEvent.ready && healthEvent.reason && (
                          <Tag color="orange">{healthEvent.reason}</Tag>
                        )}
                        <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
                          {formatTime(healthEvent.ts)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13 }}>
                        {healthEvent.pluginsMounted !== undefined && healthEvent.pluginsFailed !== undefined ? (
                          <>Plugins: {healthEvent.pluginsMounted} mounted, {healthEvent.pluginsFailed} failed</>
                        ) : (
                          <>Plugins: status unavailable</>
                        )}
                        {healthEvent.redisEnabled && (
                          <> | Redis: {healthEvent.redisHealthy ? 'healthy' : 'unhealthy'}</>
                        )}
                      </div>
                    </div>
                  ),
                };
              } else {
                const registryEvent = event as RegistryEvent;
                return {
                  key: index,
                  color: registryEvent.stale ? 'orange' : 'blue',
                  dot: <ApiOutlined />,
                  children: (
                    <div>
                      <div style={{ marginBottom: 4 }}>
                        <Tag color="purple">REGISTRY</Tag>
                        <Tag>{String(registryEvent.rev).substring(0, 8)}</Tag>
                        {registryEvent.stale && <Tag color="orange">STALE</Tag>}
                        {registryEvent.partial && <Tag color="orange">PARTIAL</Tag>}
                        <span style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
                          {formatTime(registryEvent.generatedAt)}
                        </span>
                      </div>
                      {registryEvent.checksum && (
                        <div style={{ fontSize: 13 }}>
                          Checksum: {registryEvent.checksum.substring(0, 16)}...
                          {registryEvent.previousChecksum && ' (changed)'}
                        </div>
                      )}
                    </div>
                  ),
                };
              }
            })}
          />
        ) : (
          <Alert
            message="No events received yet"
            description="Waiting for system events..."
            type="info"
            showIcon
            icon={<SyncOutlined spin />}
          />
        )}
      </Card>
    </KBPageContainer>
  );
}
