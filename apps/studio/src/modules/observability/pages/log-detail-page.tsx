import {
  Card,
  Alert,
  Badge,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Descriptions,
  Tooltip,
  message,
  Spin,
  Divider,
  Timeline,
  Empty,
} from 'antd';
import {
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  BugOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { LogRecord } from '@kb-labs/studio-data-client';

const { Text, Paragraph, Title } = Typography;

/**
 * Format timestamp to full datetime with milliseconds
 */
function formatDateTime(timestamp: string | number): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp : timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
}

/**
 * Format relative time (e.g., "2 minutes ago")
 */
function formatRelativeTime(timestamp: string | number): string {
  const ms = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const seconds = Math.floor((Date.now() - ms) / 1000);

  if (seconds < 60) {return `${seconds}s ago`;}
  if (seconds < 3600) {return `${Math.floor(seconds / 60)}m ago`;}
  if (seconds < 86400) {return `${Math.floor(seconds / 3600)}h ago`;}
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Get log level icon
 */
function getLevelIcon(level: LogRecord['level']) {
  switch (level) {
    case 'trace':
    case 'debug':
      return <BugOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />;
    case 'info':
      return <InfoCircleOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
    case 'warn':
      return <WarningOutlined style={{ fontSize: 20, color: '#faad14' }} />;
    case 'error':
    case 'fatal':
      return <CloseCircleOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />;
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
    case 'fatal':
      return 'red';
  }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  message.success(`${label} copied to clipboard`);
}

/**
 * Log Detail Page
 *
 * Shows detailed view of a single log with:
 * - Full log context (message, level, source, timestamp)
 * - Error details (stack trace if available)
 * - Related logs timeline (based on correlation IDs)
 * - All log metadata fields
 */
export function LogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sources = useDataSources();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [log, setLog] = useState<LogRecord | null>(null);
  const [relatedLogs, setRelatedLogs] = useState<LogRecord[]>([]);
  const [correlationKeys, setCorrelationKeys] = useState<any>(null);

  useEffect(() => {
    if (!id) {return;}

    const loadLog = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch log with related logs
        const response = await sources.observability.getLog(id, true);

        setLog(response.log);
        setRelatedLogs(response.related || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [id, sources.observability]);

  // Load correlation keys separately if we have the log
  useEffect(() => {
    if (!id || !log) {return;}

    const loadRelated = async () => {
      try {
        const response = await sources.observability.getRelatedLogs(id);
        setCorrelationKeys(response.correlationKeys);
      } catch (err) {
        // Silent fail - correlation keys are nice-to-have
        console.error('Failed to load correlation keys:', err);
      }
    };

    loadRelated();
  }, [id, log, sources.observability]);

  if (loading) {
    return (
      <KBPageContainer>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Loading log details..." />
        </div>
      </KBPageContainer>
    );
  }

  if (error || !log) {
    return (
      <KBPageContainer>
        <KBPageHeader
          title="Log Not Found"
          description="The requested log could not be found"
          onBack={() => navigate('/observability/logs')}
        />
        <Alert
          message={error ? 'Error loading log' : 'Log not found'}
          description={error ? error.message : `Log with ID '${id}' does not exist`}
          type="error"
          showIcon
        />
      </KBPageContainer>
    );
  }

  // Extract error details if present
  const errorDetails = log.err || log.error;
  const hasError = !!errorDetails;

  // Build metadata fields (exclude standard fields and error)
  const metadataFields = { ...log };
  delete metadataFields.time;
  delete metadataFields.level;
  delete metadataFields.msg;
  delete metadataFields.plugin;
  delete metadataFields.err;
  delete metadataFields.error;
  delete metadataFields.traceId;
  delete metadataFields.executionId;
  delete metadataFields.requestId;
  delete metadataFields.sessionId;

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Log Details"
        description={`Viewing log from ${formatRelativeTime(log.time)}`}
        onBack={() => navigate('/observability/logs')}
        extra={[
          <Button
            key="copy-link"
            icon={<LinkOutlined />}
            onClick={() => copyToClipboard(window.location.href, 'Link')}
          >
            Copy Link
          </Button>,
          <Button
            key="copy-json"
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(JSON.stringify(log, null, 2), 'JSON')}
          >
            Export JSON
          </Button>,
        ]}
      />

      {/* Log Overview Card */}
      <Card
        style={{ marginBottom: 16 }}
        title={
          <Space>
            {getLevelIcon(log.level)}
            <span>Log Overview</span>
            <Tag color={getLevelColor(log.level)}>{log.level.toUpperCase()}</Tag>
          </Space>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Timestamp">
            <Space>
              <ClockCircleOutlined />
              <Text code>{formatDateTime(log.time)}</Text>
              <Text type="secondary">({formatRelativeTime(log.time)})</Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Source">
            <Tag color="purple">{log.plugin || log.source || 'unknown'}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Message" span={2}>
            <Text strong style={{ fontSize: 14 }}>
              {log.msg || '(no message)'}
            </Text>
          </Descriptions.Item>

          {/* Correlation IDs */}
          {log.traceId && (
            <Descriptions.Item label="Trace ID">
              <Space>
                <Text code>{log.traceId}</Text>
                <Tooltip title="Copy trace ID">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(String(log.traceId), 'Trace ID')}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          )}

          {log.executionId && (
            <Descriptions.Item label="Execution ID">
              <Space>
                <Text code>{log.executionId}</Text>
                <Tooltip title="Copy execution ID">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(String(log.executionId), 'Execution ID')}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          )}

          {log.requestId && (
            <Descriptions.Item label="Request ID">
              <Space>
                <Text code>{log.requestId}</Text>
                <Tooltip title="Copy request ID">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(String(log.requestId), 'Request ID')}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          )}

          {log.sessionId && (
            <Descriptions.Item label="Session ID">
              <Space>
                <Text code>{log.sessionId}</Text>
                <Tooltip title="Copy session ID">
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(String(log.sessionId), 'Session ID')}
                  />
                </Tooltip>
              </Space>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Error Details Card (if error exists) */}
      {hasError && (
        <Card
          style={{ marginBottom: 16 }}
          title={
            <Space>
              <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>Error Details</span>
            </Space>
          }
          type="inner"
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {errorDetails.name && (
              <div>
                <Text type="secondary">Error Type:</Text>
                <br />
                <Tag color="red">{errorDetails.name}</Tag>
              </div>
            )}

            {errorDetails.message && (
              <div>
                <Text type="secondary">Error Message:</Text>
                <br />
                <Text strong>{errorDetails.message}</Text>
              </div>
            )}

            {errorDetails.stack && (
              <div>
                <Text type="secondary">Stack Trace:</Text>
                <Paragraph
                  copyable
                  code
                  style={{
                    marginTop: 8,
                    backgroundColor: '#fafafa',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 300,
                    overflow: 'auto',
                  }}
                >
                  {errorDetails.stack}
                </Paragraph>
              </div>
            )}
          </Space>
        </Card>
      )}

      {/* Related Logs Timeline */}
      <Card
        style={{ marginBottom: 16 }}
        title={
          <Space>
            <ClockCircleOutlined />
            <span>Related Logs Timeline</span>
            {relatedLogs.length > 0 && (
              <Badge count={relatedLogs.length} style={{ backgroundColor: '#52c41a' }} />
            )}
          </Space>
        }
      >
        {relatedLogs.length === 0 ? (
          <Empty
            description="No related logs found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {correlationKeys && (
              <Alert
                message="Correlation Keys"
                description={
                  <Space wrap>
                    {correlationKeys.requestId && (
                      <Tag>Request: {correlationKeys.requestId}</Tag>
                    )}
                    {correlationKeys.traceId && (
                      <Tag>Trace: {correlationKeys.traceId}</Tag>
                    )}
                    {correlationKeys.executionId && (
                      <Tag>Execution: {correlationKeys.executionId}</Tag>
                    )}
                    {correlationKeys.sessionId && (
                      <Tag>Session: {correlationKeys.sessionId}</Tag>
                    )}
                  </Space>
                }
                type="info"
                style={{ marginBottom: 16 }}
                closable
              />
            )}

            <Timeline
              mode="left"
              items={relatedLogs.map((relatedLog) => {
                const isCurrentLog = relatedLog.id === id;

                return {
                  color: isCurrentLog ? 'red' : getLevelColor(relatedLog.level),
                  dot: isCurrentLog ? (
                    <Badge status="processing" />
                  ) : (
                    getLevelIcon(relatedLog.level)
                  ),
                  label: (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDateTime(relatedLog.time)}
                    </Text>
                  ),
                  children: (
                    <Card
                      size="small"
                      style={{
                        backgroundColor: isCurrentLog ? '#fff7e6' : undefined,
                        borderColor: isCurrentLog ? '#ffa940' : undefined,
                      }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <Space>
                          <Tag color={getLevelColor(relatedLog.level)}>
                            {relatedLog.level.toUpperCase()}
                          </Tag>
                          {relatedLog.plugin && (
                            <Tag color="purple">{relatedLog.plugin}</Tag>
                          )}
                          {isCurrentLog && (
                            <Tag color="orange">YOU ARE HERE</Tag>
                          )}
                        </Space>
                        <Text>{relatedLog.msg || '(no message)'}</Text>
                        {relatedLog.err && (
                          <Tag color="red" icon={<CloseCircleOutlined />}>
                            {String(relatedLog.err.name || relatedLog.err.type || 'Error')}
                          </Tag>
                        )}
                      </Space>
                    </Card>
                  ),
                };
              })}
            />
          </>
        )}
      </Card>

      {/* All Log Fields */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>All Log Fields</span>
          </Space>
        }
      >
        <Paragraph
          copyable
          code
          style={{
            backgroundColor: '#fafafa',
            padding: 16,
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: 500,
            overflow: 'auto',
          }}
        >
          {JSON.stringify(log, null, 2)}
        </Paragraph>
      </Card>
    </KBPageContainer>
  );
}
