import {
  Card,
  Alert,
  Badge,
  Tag,
  List,
  Typography,
  Space,
  Row,
  Col,
  Select,
  DatePicker,
  Button,
  Collapse,
  Descriptions,
  Tooltip,
  message,
  Modal,
  Input,
  Checkbox,
  Divider,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  BugOutlined,
  CopyOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  GroupOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useLogStream } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { LogRecord } from '@kb-labs/studio-data-client';
import dayjs, { Dayjs } from 'dayjs';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Time range presets for quick filtering
 */
const TIME_RANGES = {
  '5m': { label: 'Last 5 minutes', minutes: 5 },
  '15m': { label: 'Last 15 minutes', minutes: 15 },
  '1h': { label: 'Last hour', minutes: 60 },
  '6h': { label: 'Last 6 hours', minutes: 360 },
  '24h': { label: 'Last 24 hours', minutes: 1440 },
  custom: { label: 'Custom range', minutes: 0 },
};

/**
 * Quick question templates for AI summarization
 */
const QUESTION_TEMPLATES = [
  { label: 'What happened?', value: 'What happened in these logs?' },
  { label: 'Show errors', value: 'What errors occurred and what caused them?' },
  { label: 'Find patterns', value: 'Are there any patterns or repeated issues?' },
  { label: 'Performance issues', value: 'Are there any performance or latency issues?' },
  { label: 'Timeline', value: 'Give me a timeline of key events' },
  { label: 'Root cause', value: 'What is the root cause of the errors?' },
];

/**
 * Format timestamp to time string
 */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Format timestamp to full datetime
 */
function formatDateTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
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
 * Copy text to clipboard
 */
function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text);
  message.success(`${label} copied to clipboard`);
}

/**
 * Group logs by a field
 */
function groupLogsByField(logs: LogRecord[], field: keyof LogRecord): Map<string, LogRecord[]> {
  const groups = new Map<string, LogRecord[]>();
  for (const log of logs) {
    const key = String(log[field] || 'unknown');
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(log);
  }
  return groups;
}

/**
 * Calculate log statistics for AI summarization
 */
function calculateLogStats(logs: LogRecord[]) {
  const stats = {
    total: logs.length,
    byLevel: {} as Record<string, number>,
    byPlugin: {} as Record<string, number>,
    errorCount: 0,
    warningCount: 0,
    uniqueTraces: new Set<string>(),
    uniqueExecutions: new Set<string>(),
    timeRange: {
      oldest: logs.length > 0 ? logs[0]!.time : null,
      newest: logs.length > 0 ? logs[logs.length - 1]!.time : null,
    },
  };

  for (const log of logs) {
    // Count by level
    stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

    // Count by plugin
    if (log.plugin) {
      stats.byPlugin[log.plugin] = (stats.byPlugin[log.plugin] || 0) + 1;
    }

    // Track errors and warnings
    if (log.level === 'error') stats.errorCount++;
    if (log.level === 'warn') stats.warningCount++;

    // Track unique traces and executions
    if (log.trace) stats.uniqueTraces.add(log.trace);
    if (log.executionId) stats.uniqueExecutions.add(log.executionId);
  }

  return stats;
}

/**
 * Live Logs Page with AI Summarization support
 *
 * Features:
 * - Real-time log streaming via SSE
 * - Advanced filtering (time, level, plugin, trace)
 * - Log grouping (by trace, execution, plugin)
 * - Expandable log details
 * - Copy traceId/executionId
 * - Statistics for AI summarization
 */
export function LogsPage() {
  const sources = useDataSources();
  const { logs, isConnected, error, clearLogs } = useLogStream(sources.observability);

  // Filters
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [pluginFilter, setPluginFilter] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('15m');
  const [customTimeRange, setCustomTimeRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [groupBy, setGroupBy] = useState<'none' | 'trace' | 'execution' | 'plugin'>('none');

  // AI Summarize Modal
  const [summarizeModalOpen, setSummarizeModalOpen] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [includeContext, setIncludeContext] = useState({
    errors: true,
    warnings: true,
    info: false,
    metadata: true,
    stackTraces: true,
  });
  const [summarizing, setSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);

  // Calculate filtered logs
  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Apply level filter
    if (levelFilter) {
      filtered = filtered.filter((log) => log.level === levelFilter);
    }

    // Apply plugin filter
    if (pluginFilter) {
      filtered = filtered.filter((log) => log.plugin === pluginFilter);
    }

    // Apply time range filter
    if (timeRange !== 'custom') {
      const rangeMinutes = TIME_RANGES[timeRange as keyof typeof TIME_RANGES]?.minutes || 15;
      const cutoff = Date.now() - rangeMinutes * 60 * 1000;
      filtered = filtered.filter((log) => new Date(log.time).getTime() >= cutoff);
    } else if (customTimeRange) {
      const [start, end] = customTimeRange;
      filtered = filtered.filter((log) => {
        const logTime = dayjs(log.time);
        return logTime.isAfter(start) && logTime.isBefore(end);
      });
    }

    return filtered;
  }, [logs, levelFilter, pluginFilter, timeRange, customTimeRange]);

  // Calculate statistics (for AI summarization)
  const stats = useMemo(() => calculateLogStats(filteredLogs), [filteredLogs]);

  // Get unique plugins for filter dropdown
  const uniquePlugins = useMemo(() => {
    return Array.from(new Set(logs.map((log) => log.plugin).filter(Boolean)));
  }, [logs]);

  // Group logs if needed
  const groupedLogs = useMemo(() => {
    if (groupBy === 'none') return null;

    switch (groupBy) {
      case 'trace':
        return groupLogsByField(filteredLogs, 'trace');
      case 'execution':
        return groupLogsByField(filteredLogs, 'executionId');
      case 'plugin':
        return groupLogsByField(filteredLogs, 'plugin');
      default:
        return null;
    }
  }, [filteredLogs, groupBy]);

  /**
   * Render single log item with expandable details
   */
  const renderLogItem = (log: LogRecord, index: number) => (
    <Collapse
      ghost
      key={`${log.time}-${index}`}
      items={[
        {
          key: index,
          label: (
            <Space>
              {getLevelIcon(log.level)}
              <Tag color={getLevelColor(log.level)}>{log.level.toUpperCase()}</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatTime(log.time)}
              </Text>
              {log.plugin && <Tag color="purple">{log.plugin}</Tag>}
              {log.executionId && (
                <Tooltip title="Click to copy execution ID">
                  <Tag
                    color="cyan"
                    style={{ fontSize: 11, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(log.executionId!, 'Execution ID');
                    }}
                    icon={<CopyOutlined />}
                  >
                    {log.executionId.slice(0, 8)}
                  </Tag>
                </Tooltip>
              )}
              {log.trace && (
                <Tooltip title="Click to copy trace ID">
                  <Tag
                    color="geekblue"
                    style={{ fontSize: 11, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(log.trace!, 'Trace ID');
                    }}
                    icon={<CopyOutlined />}
                  >
                    {log.trace.slice(0, 8)}
                  </Tag>
                </Tooltip>
              )}
              <Text>{log.msg || '(no message)'}</Text>
            </Space>
          ),
          children: (
            <Descriptions bordered size="small" column={2}>
              <Descriptions.Item label="Timestamp">{formatDateTime(log.time)}</Descriptions.Item>
              <Descriptions.Item label="Level">
                <Tag color={getLevelColor(log.level)}>{log.level}</Tag>
              </Descriptions.Item>
              {log.plugin && <Descriptions.Item label="Plugin">{log.plugin}</Descriptions.Item>}
              {log.executionId && (
                <Descriptions.Item label="Execution ID">
                  <Paragraph
                    copyable={{ text: log.executionId }}
                    style={{ marginBottom: 0, fontSize: 12 }}
                  >
                    {log.executionId}
                  </Paragraph>
                </Descriptions.Item>
              )}
              {log.trace && (
                <Descriptions.Item label="Trace ID">
                  <Paragraph copyable={{ text: log.trace }} style={{ marginBottom: 0, fontSize: 12 }}>
                    {log.trace}
                  </Paragraph>
                </Descriptions.Item>
              )}
              {log.span && <Descriptions.Item label="Span ID">{log.span}</Descriptions.Item>}
              {log.tenantId && <Descriptions.Item label="Tenant">{log.tenantId}</Descriptions.Item>}
              {log.command && <Descriptions.Item label="Command">{log.command}</Descriptions.Item>}
              {log.err && (
                <>
                  <Descriptions.Item label="Error Name" span={2}>
                    <Text type="danger">{log.err.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Error Message" span={2}>
                    <Text type="danger">{log.err.message}</Text>
                  </Descriptions.Item>
                  {log.err.stack && (
                    <Descriptions.Item label="Stack Trace" span={2}>
                      <Paragraph
                        copyable={{ text: log.err.stack }}
                        style={{
                          fontSize: 11,
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          maxHeight: 200,
                          overflow: 'auto',
                        }}
                      >
                        {log.err.stack}
                      </Paragraph>
                    </Descriptions.Item>
                  )}
                </>
              )}
              {log.meta && Object.keys(log.meta).length > 0 && (
                <Descriptions.Item label="Metadata" span={2}>
                  <Paragraph
                    copyable={{ text: JSON.stringify(log.meta, null, 2) }}
                    style={{
                      fontSize: 11,
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(log.meta, null, 2)}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>
          ),
        },
      ]}
    />
  );

  /**
   * Render grouped logs
   */
  const renderGroupedLogs = () => {
    if (!groupedLogs) return null;

    const groups = Array.from(groupedLogs.entries());

    return (
      <Collapse
        items={groups.map(([key, groupLogs]) => ({
          key,
          label: (
            <Space>
              <GroupOutlined />
              <Text strong>{key}</Text>
              <Badge count={groupLogs.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          ),
          children: (
            <List
              dataSource={groupLogs}
              renderItem={(log, index) => (
                <List.Item style={{ padding: '8px 0' }}>{renderLogItem(log, index)}</List.Item>
              )}
            />
          ),
        }))}
      />
    );
  };

  /**
   * Handle AI Summarization
   */
  const handleSummarize = async () => {
    setSummarizing(true);
    setSummaryResult(null);

    try {
      // Build request
      const request = {
        question: customQuestion,
        includeContext,
        timeRange:
          timeRange === 'custom' && customTimeRange
            ? {
                from: customTimeRange[0].toISOString(),
                to: customTimeRange[1].toISOString(),
              }
            : timeRange !== 'custom'
            ? {
                from: dayjs()
                  .subtract(TIME_RANGES[timeRange as keyof typeof TIME_RANGES].minutes, 'minutes')
                  .toISOString(),
                to: dayjs().toISOString(),
              }
            : undefined,
        filters: {
          level: levelFilter || undefined,
          plugin: pluginFilter || undefined,
        },
        groupBy: groupBy !== 'none' ? groupBy : undefined,
      };

      // Call API through data source
      const result = await sources.observability.summarizeLogs(request);

      if (!result.ok) {
        throw new Error('Summarization failed');
      }

      setSummaryResult(result.data.aiSummary || 'No summary generated');
    } catch (err: any) {
      message.error('Failed to generate summary: ' + err.message);
    } finally {
      setSummarizing(false);
    }
  };

  /**
   * Open AI Summarize modal
   */
  const openSummarizeModal = () => {
    setSummarizeModalOpen(true);
    setSummaryResult(null);
    setCustomQuestion('');
  };

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Live Logs"
        description="Real-time application logs with AI-ready filtering and grouping"
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

      {/* Filters & Stats (Collapsible) */}
      <Card style={{ marginBottom: 16 }}>
        <Collapse
          defaultActiveKey={['filters']}
          ghost
          items={[
            {
              key: 'filters',
              label: (
                <Space>
                  <FilterOutlined />
                  <Text strong>Filters & Statistics</Text>
                  <Badge count={filteredLogs.length} style={{ backgroundColor: '#52c41a' }} />
                </Space>
              ),
              children: (
                <>
                  <Row gutter={[16, 16]}>
                    <Col span={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FilterOutlined /> Level
                        </Text>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="All levels"
                          allowClear
                          value={levelFilter}
                          onChange={setLevelFilter}
                        >
                          <Option value="trace">Trace</Option>
                          <Option value="debug">Debug</Option>
                          <Option value="info">Info</Option>
                          <Option value="warn">Warning</Option>
                          <Option value="error">Error</Option>
                        </Select>
                      </Space>
                    </Col>

                    <Col span={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <FilterOutlined /> Plugin
                        </Text>
                        <Select
                          style={{ width: '100%' }}
                          placeholder="All plugins"
                          allowClear
                          value={pluginFilter}
                          onChange={setPluginFilter}
                        >
                          {uniquePlugins.map((plugin) => (
                            <Option key={plugin} value={plugin}>
                              {plugin}
                            </Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>

                    <Col span={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined /> Time Range
                        </Text>
                        <Select style={{ width: '100%' }} value={timeRange} onChange={setTimeRange}>
                          {Object.entries(TIME_RANGES).map(([key, { label }]) => (
                            <Option key={key} value={key}>
                              {label}
                            </Option>
                          ))}
                        </Select>
                      </Space>
                    </Col>

                    <Col span={6}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <GroupOutlined /> Group By
                        </Text>
                        <Select style={{ width: '100%' }} value={groupBy} onChange={setGroupBy}>
                          <Option value="none">No grouping</Option>
                          <Option value="trace">Trace ID</Option>
                          <Option value="execution">Execution ID</Option>
                          <Option value="plugin">Plugin</Option>
                        </Select>
                      </Space>
                    </Col>

                    {timeRange === 'custom' && (
                      <Col span={24}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            Custom Time Range
                          </Text>
                          <RangePicker
                            showTime
                            style={{ width: '100%' }}
                            onChange={(dates) =>
                              setCustomTimeRange(dates as [Dayjs, Dayjs] | null)
                            }
                          />
                        </Space>
                      </Col>
                    )}
                  </Row>

                  {/* Statistics (for AI Summarization) */}
                  <Row
                    gutter={16}
                    style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}
                  >
                    <Col span={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Total Logs
                      </Text>
                      <div>
                        <Text strong style={{ fontSize: 20 }}>
                          {stats.total}
                        </Text>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Errors
                      </Text>
                      <div>
                        <Text type="danger" strong style={{ fontSize: 20 }}>
                          {stats.errorCount}
                        </Text>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Warnings
                      </Text>
                      <div>
                        <Text type="warning" strong style={{ fontSize: 20 }}>
                          {stats.warningCount}
                        </Text>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Unique Traces
                      </Text>
                      <div>
                        <Text strong style={{ fontSize: 20 }}>
                          {stats.uniqueTraces.size}
                        </Text>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Unique Executions
                      </Text>
                      <div>
                        <Text strong style={{ fontSize: 20 }}>
                          {stats.uniqueExecutions.size}
                        </Text>
                      </div>
                    </Col>
                    <Col span={4}>
                      <Button
                        type="primary"
                        icon={<RobotOutlined />}
                        onClick={openSummarizeModal}
                        disabled={filteredLogs.length === 0}
                      >
                        AI Summarize
                      </Button>
                    </Col>
                  </Row>
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Logs List */}
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              {groupBy === 'none' ? 'Recent Logs' : `Logs grouped by ${groupBy}`}
            </Col>
            <Col>
              <Badge count={filteredLogs.length} showZero style={{ backgroundColor: '#52c41a' }} />
            </Col>
          </Row>
        }
        extra={
          <a onClick={clearLogs} style={{ cursor: 'pointer' }}>
            Clear
          </a>
        }
      >
        {filteredLogs.length === 0 ? (
          <Alert
            message="No logs match current filters"
            description="Adjust filters or wait for new logs to arrive"
            type="info"
            showIcon
          />
        ) : groupBy === 'none' ? (
          <List
            dataSource={filteredLogs}
            renderItem={(log, index) => (
              <List.Item style={{ padding: '8px 0' }}>{renderLogItem(log, index)}</List.Item>
            )}
          />
        ) : (
          renderGroupedLogs()
        )}
      </Card>

      {/* AI Summarize Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            <span>AI Log Summarization</span>
          </Space>
        }
        open={summarizeModalOpen}
        onCancel={() => setSummarizeModalOpen(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setSummarizeModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="summarize"
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={summarizing}
            onClick={handleSummarize}
            disabled={!customQuestion.trim()}
          >
            Generate Summary
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Data Preview */}
          <Card size="small" style={{ backgroundColor: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Text type="secondary">Logs to analyze:</Text>
                <div>
                  <Text strong>{filteredLogs.length}</Text>
                </div>
              </Col>
              <Col span={6}>
                <Text type="secondary">Errors:</Text>
                <div>
                  <Text type="danger" strong>
                    {stats.errorCount}
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <Text type="secondary">Warnings:</Text>
                <div>
                  <Text type="warning" strong>
                    {stats.warningCount}
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <Text type="secondary">Time range:</Text>
                <div>
                  <Text strong>{TIME_RANGES[timeRange as keyof typeof TIME_RANGES]?.label}</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Quick Templates */}
          <div>
            <Text strong>Quick Questions:</Text>
            <div style={{ marginTop: 8 }}>
              <Space wrap>
                {QUESTION_TEMPLATES.map((template) => (
                  <Button
                    key={template.label}
                    size="small"
                    onClick={() => setCustomQuestion(template.value)}
                  >
                    {template.label}
                  </Button>
                ))}
              </Space>
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* Custom Question */}
          <div>
            <Text strong>Your Question:</Text>
            <TextArea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Ask anything about these logs... (e.g., 'What went wrong in the last 5 minutes?')"
              rows={3}
              style={{ marginTop: 8 }}
            />
          </div>

          {/* Context Options */}
          <div>
            <Text strong>Include in context:</Text>
            <div style={{ marginTop: 8 }}>
              <Space direction="vertical">
                <Checkbox
                  checked={includeContext.errors}
                  onChange={(e) =>
                    setIncludeContext({ ...includeContext, errors: e.target.checked })
                  }
                >
                  Error messages and stack traces
                </Checkbox>
                <Checkbox
                  checked={includeContext.warnings}
                  onChange={(e) =>
                    setIncludeContext({ ...includeContext, warnings: e.target.checked })
                  }
                >
                  Warning messages
                </Checkbox>
                <Checkbox
                  checked={includeContext.info}
                  onChange={(e) =>
                    setIncludeContext({ ...includeContext, info: e.target.checked })
                  }
                >
                  Info-level logs
                </Checkbox>
                <Checkbox
                  checked={includeContext.metadata}
                  onChange={(e) =>
                    setIncludeContext({ ...includeContext, metadata: e.target.checked })
                  }
                >
                  Metadata (traceId, executionId, etc.)
                </Checkbox>
                <Checkbox
                  checked={includeContext.stackTraces}
                  onChange={(e) =>
                    setIncludeContext({ ...includeContext, stackTraces: e.target.checked })
                  }
                >
                  Full stack traces
                </Checkbox>
              </Space>
            </div>
          </div>

          {/* Summary Result */}
          {summarizing && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin tip="Analyzing logs with AI..." size="large" />
            </div>
          )}

          {summaryResult && !summarizing && (
            <Card
              title={
                <Space>
                  <RobotOutlined />
                  <span>AI Summary</span>
                </Space>
              }
              size="small"
              style={{ marginTop: 16 }}
            >
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{summaryResult}</Paragraph>
            </Card>
          )}
        </Space>
      </Modal>
    </KBPageContainer>
  );
}
