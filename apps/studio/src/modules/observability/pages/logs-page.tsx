import { Card, Alert, Badge, Tag, List, Typography, Space, Row, Col } from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  BugOutlined,
} from '@ant-design/icons';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useLogStream } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { LogRecord } from '@kb-labs/studio-data-client';

const { Text } = Typography;

/**
 * Format timestamp to time string
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Get log level icon
 */
function getLevelIcon(level: LogRecord['level']) {
  switch (level) {
    case 'trace':
    case 'debug':
      return <BugOutlined style={{ color: '#8c8c8c' }} />;
    case 'info':
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    case 'warn':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
  }
}

/**
 * Get log level tag color
 */
function getLevelColor(level: LogRecord['level']): string {
  switch (level) {
    case 'trace':
    case 'debug':
      return 'default';
    case 'info':
      return 'blue';
    case 'warn':
      return 'orange';
    case 'error':
      return 'red';
  }
}

/**
 * Live Logs Page
 *
 * Shows real-time logs from /logs/stream SSE endpoint:
 * - Live streaming logs
 * - Level-based filtering
 * - Plugin/execution context
 */
export function LogsPage() {
  const sources = useDataSources();
  const { logs, isConnected, error, clearLogs } = useLogStream(sources.observability);

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Live Logs"
        description="Real-time application logs - Auto-updates via Server-Sent Events"
      />

      {/* Connection Status */}
      {!isConnected && !error && (
        <Alert
          message="Connecting to log stream..."
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
          message="Connected to log stream"
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Logs List */}
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>Recent Logs</Col>
            <Col>
              <Badge count={logs.length} showZero style={{ backgroundColor: '#52c41a' }} />
            </Col>
          </Row>
        }
        extra={
          <a onClick={clearLogs} style={{ cursor: 'pointer' }}>
            Clear
          </a>
        }
      >
        {logs.length === 0 ? (
          <Alert
            message="No logs received yet"
            description="Logs will appear here as they are generated"
            type="info"
            showIcon
          />
        ) : (
          <List
            dataSource={logs}
            renderItem={(log) => (
              <List.Item key={`${log.time}-${Math.random()}`}>
                <List.Item.Meta
                  avatar={getLevelIcon(log.level)}
                  title={
                    <Space>
                      <Tag color={getLevelColor(log.level)}>{log.level.toUpperCase()}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatTime(log.time)}
                      </Text>
                      {log.plugin && <Tag color="purple">{log.plugin}</Tag>}
                      {log.executionId && (
                        <Tag color="cyan" style={{ fontSize: 11 }}>
                          {log.executionId.slice(0, 8)}
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text>{log.msg || '(no message)'}</Text>
                      {log.err && (
                        <div style={{ marginTop: 8 }}>
                          <Text type="danger">
                            {log.err.name}: {log.err.message}
                          </Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </KBPageContainer>
  );
}
