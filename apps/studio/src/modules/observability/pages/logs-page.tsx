import {
  UICard,
  UIAlert,
  UIBadge,
  UITag,
  UIList,
  UITypographyText,
  UITypographyParagraph,
  UISpace,
  UIRow,
  UICol,
  UISelect,
  UIButton,
  UIAccordion,
  UIDescriptions,
  UIDescriptionsItem,
  UITooltip,
  UIMessage,
  UIModal,
  UIInput,
  UIDivider,
  UISpin,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { UIRangePicker, UICheckbox } from '@kb-labs/studio-ui-kit';
import { useState, useMemo, useEffect } from 'react';
import { useLogStream } from '@kb-labs/studio-data-client';
import { useDataSources } from '../../../providers/data-sources-provider';
import type { LogRecord, LogSummarizeResponse } from '@kb-labs/studio-data-client';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

const { TextArea } = UIInput;

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
      return <UIIcon name="BugOutlined" style={{ color: '#8c8c8c' }} />;
    case 'info':
      return <UIIcon name="InfoCircleOutlined" style={{ color: '#1890ff' }} />;
    case 'warn':
      return <UIIcon name="WarningOutlined" style={{ color: '#faad14' }} />;
    case 'error':
      return <UIIcon name="CloseCircleOutlined" style={{ color: '#ff4d4f' }} />;
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
  UIMessage.success(`${label} copied to clipboard`);
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
    if (log.level === 'error') {stats.errorCount++;}
    if (log.level === 'warn') {stats.warningCount++;}

    // Track unique traces and executions
    if (log.trace) {stats.uniqueTraces.add(log.trace);}
    if (log.executionId) {stats.uniqueExecutions.add(log.executionId);}
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
  const { logs: streamLogs, isConnected, error, clearLogs } = useLogStream(sources.observability);

  // Pause/Resume state
  const [isPaused, setIsPaused] = useState(false);
  const [frozenLogs, setFrozenLogs] = useState<LogRecord[]>([]);

  // Update frozen logs when not paused
  useEffect(() => {
    if (!isPaused) {
      setFrozenLogs(streamLogs);
    }
  }, [streamLogs, isPaused]);

  // Use frozen logs when paused, stream logs when not
  const logs = isPaused ? frozenLogs : streamLogs;

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
  const [summaryResult, setSummaryResult] = useState<LogSummarizeResponse['data'] | null>(null);

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
    if (groupBy === 'none') {return null;}

    switch (groupBy) {
      case 'trace':
        return groupLogsByField(filteredLogs, 'traceId');
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
  const renderLogItem = (log: LogRecord, index: number) => {
    // Build clean JSON representation for expansion
    const logData = { ...log };

    // Safe JSON stringify (handles circular refs and errors)
    let jsonString: string;
    try {
      jsonString = JSON.stringify(logData, null, 2);
    } catch (err) {
      // Fallback if JSON.stringify fails (circular refs, etc.)
      jsonString = JSON.stringify(
        {
          ...logData,
          err: logData.err ? {
            name: String(logData.err.name || 'Error'),
            message: String(logData.err.message || ''),
            stack: String(logData.err.stack || '').split('\n').slice(0, 10).join('\n'),
          } : undefined,
        },
        null,
        2
      );
    }

    return (
      <UIAccordion
        ghost
        key={`${log.time}-${index}`}
        items={[
          {
            key: index,
            label: (
              <UISpace>
                <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                  {formatTime(log.time)}
                </UITypographyText>
                {getLevelIcon(log.level)}
                <UITag color={getLevelColor(log.level)}>{log.level.toUpperCase()}</UITag>
                {log.plugin && <UITag color="purple">{log.plugin}</UITag>}
                <UITypographyText>{log.msg || '(no message)'}</UITypographyText>
                {log.err && (
                  <UITag color="red" icon={<UIIcon name="CloseCircleOutlined" />}>
                    {String(log.err.name || log.err.type || 'Error')}
                  </UITag>
                )}
                {log.traceId && (
                  <UITooltip title="Click to copy trace ID">
                    <UITag
                      color="default"
                      style={{ fontSize: 11, cursor: 'pointer', color: '#8c8c8c' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(String(log.traceId), 'Trace ID');
                      }}
                      icon={<UIIcon name="CopyOutlined" />}
                    >
                      {String(log.traceId).slice(0, 8)}
                    </UITag>
                  </UITooltip>
                )}
              </UISpace>
            ),
            children: (
              <div style={{ backgroundColor: '#fafafa', padding: 16, borderRadius: 4, marginLeft: -24, marginRight: -24 }}>
                <UITypographyParagraph
                  copyable={{ text: jsonString }}
                  style={{
                    marginBottom: 0,
                    fontSize: 12,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  {jsonString}
                </UITypographyParagraph>
              </div>
            ),
          },
        ]}
      />
    );
  };

  /**
   * Render grouped logs
   */
  const renderGroupedLogs = () => {
    if (!groupedLogs) {return null;}

    const groups = Array.from(groupedLogs.entries());

    return (
      <UIAccordion
        items={groups.map(([key, groupLogs]) => ({
          key,
          label: (
            <UISpace>
              <UIIcon name="GroupOutlined" />
              <UITypographyText strong>{key}</UITypographyText>
              <UIBadge count={groupLogs.length} style={{ backgroundColor: '#52c41a' }} />
            </UISpace>
          ),
          children: (
            <UIList
              dataSource={groupLogs}
              renderItem={(log, index) => (
                <UIList.Item style={{ padding: '8px 0' }}>{renderLogItem(log, index)}</UIList.Item>
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
      // Note: HttpClient auto-unwraps { ok: true, data: {...} } envelope
      const result = await sources.observability.summarizeLogs(request);

      // Store the full result data for structured rendering
      setSummaryResult(result);
    } catch (err: any) {
      UIMessage.error('Failed to generate summary: ' + err.message);
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
        <UIAlert
          message="Connecting to log stream..."
          type="info"
          showIcon
          icon={<UIIcon name="SyncOutlined" spin />}
          style={{ marginBottom: 24 }}
        />
      )}

      {error && (
        <UIAlert
          message="Connection failed"
          description={error.message + ' - Make sure REST API is running on localhost:5050'}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {isConnected && (
        <UIAlert
          message="Connected to log stream"
          type="success"
          showIcon
          icon={<UIIcon name="CheckCircleOutlined" />}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Filters & Stats (Collapsible) */}
      <UICard style={{ marginBottom: 16 }}>
        <UIAccordion
          defaultActiveKey={['filters']}
          ghost
          items={[
            {
              key: 'filters',
              label: (
                <UISpace>
                  <UIIcon name="FilterOutlined" />
                  <UITypographyText strong>Filters & Statistics</UITypographyText>
                  <UIBadge count={filteredLogs.length} style={{ backgroundColor: '#52c41a' }} />
                </UISpace>
              ),
              children: (
                <>
                  <UIRow gutter={[16, 16]}>
                    <UICol span={6}>
                      <UISpace direction="vertical" style={{ width: '100%' }}>
                        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                          <UIIcon name="FilterOutlined" /> Level
                        </UITypographyText>
                        <UISelect
                          style={{ width: '100%' }}
                          placeholder="All levels"
                          allowClear
                          value={levelFilter}
                          onChange={setLevelFilter}
                          options={[
                            { label: 'Trace', value: 'trace' },
                            { label: 'Debug', value: 'debug' },
                            { label: 'Info', value: 'info' },
                            { label: 'Warning', value: 'warn' },
                            { label: 'Error', value: 'error' },
                          ]}
                        />
                      </UISpace>
                    </UICol>

                    <UICol span={6}>
                      <UISpace direction="vertical" style={{ width: '100%' }}>
                        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                          <UIIcon name="FilterOutlined" /> Plugin
                        </UITypographyText>
                        <UISelect
                          style={{ width: '100%' }}
                          placeholder="All plugins"
                          allowClear
                          value={pluginFilter}
                          onChange={setPluginFilter}
                          options={uniquePlugins.map((plugin) => ({ label: plugin, value: plugin }))}
                        />
                      </UISpace>
                    </UICol>

                    <UICol span={6}>
                      <UISpace direction="vertical" style={{ width: '100%' }}>
                        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                          <UIIcon name="ClockCircleOutlined" /> Time Range
                        </UITypographyText>
                        <UISelect
                          style={{ width: '100%' }}
                          value={timeRange}
                          onChange={setTimeRange}
                          options={Object.entries(TIME_RANGES).map(([key, { label }]) => ({
                            label,
                            value: key,
                          }))}
                        />
                      </UISpace>
                    </UICol>

                    <UICol span={6}>
                      <UISpace direction="vertical" style={{ width: '100%' }}>
                        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                          <UIIcon name="GroupOutlined" /> Group By
                        </UITypographyText>
                        <UISelect
                          style={{ width: '100%' }}
                          value={groupBy}
                          onChange={setGroupBy}
                          options={[
                            { label: 'No grouping', value: 'none' },
                            { label: 'Trace ID', value: 'trace' },
                            { label: 'Execution ID', value: 'execution' },
                            { label: 'Plugin', value: 'plugin' },
                          ]}
                        />
                      </UISpace>
                    </UICol>

                    {timeRange === 'custom' && (
                      <UICol span={24}>
                        <UISpace direction="vertical" style={{ width: '100%' }}>
                          <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                            Custom Time Range
                          </UITypographyText>
                          <UIRangePicker
                            showTime
                            style={{ width: '100%' }}
                            onChange={(dates) =>
                              setCustomTimeRange(dates as [Dayjs, Dayjs] | null)
                            }
                          />
                        </UISpace>
                      </UICol>
                    )}
                  </UIRow>

                  {/* Statistics (for AI Summarization) */}
                  <UIRow
                    gutter={16}
                    style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}
                  >
                    <UICol span={4}>
                      <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                        Total Logs
                      </UITypographyText>
                      <div>
                        <UITypographyText strong style={{ fontSize: 20 }}>
                          {stats.total}
                        </UITypographyText>
                      </div>
                    </UICol>
                    <UICol span={4}>
                      <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                        Errors
                      </UITypographyText>
                      <div>
                        <UITypographyText type="danger" strong style={{ fontSize: 20 }}>
                          {stats.errorCount}
                        </UITypographyText>
                      </div>
                    </UICol>
                    <UICol span={4}>
                      <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                        Warnings
                      </UITypographyText>
                      <div>
                        <UITypographyText type="warning" strong style={{ fontSize: 20 }}>
                          {stats.warningCount}
                        </UITypographyText>
                      </div>
                    </UICol>
                    <UICol span={4}>
                      <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                        Unique Traces
                      </UITypographyText>
                      <div>
                        <UITypographyText strong style={{ fontSize: 20 }}>
                          {stats.uniqueTraces.size}
                        </UITypographyText>
                      </div>
                    </UICol>
                    <UICol span={4}>
                      <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                        Unique Executions
                      </UITypographyText>
                      <div>
                        <UITypographyText strong style={{ fontSize: 20 }}>
                          {stats.uniqueExecutions.size}
                        </UITypographyText>
                      </div>
                    </UICol>
                    <UICol span={4}>
                      <UIButton
                        type="primary"
                        icon={<UIIcon name="RobotOutlined" />}
                        onClick={openSummarizeModal}
                        disabled={filteredLogs.length === 0}
                      >
                        AI Summarize
                      </UIButton>
                    </UICol>
                  </UIRow>
                </>
              ),
            },
          ]}
        />
      </UICard>

      {/* Logs List */}
      <UICard
        title={
          <UISpace>
            <span>{groupBy === 'none' ? 'Recent Logs' : `Logs grouped by ${groupBy}`}</span>
            <UIBadge count={filteredLogs.length} showZero style={{ backgroundColor: '#52c41a' }} />
          </UISpace>
        }
        extra={
          <UISpace>
            <UIButton
              size="small"
              icon={isPaused ? <UIIcon name="SyncOutlined" /> : <UIIcon name="ClockCircleOutlined" />}
              onClick={() => setIsPaused(!isPaused)}
              type={isPaused ? 'primary' : 'default'}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </UIButton>
            <UIButton size="small" onClick={clearLogs}>
              Clear
            </UIButton>
          </UISpace>
        }
      >
        {filteredLogs.length === 0 ? (
          <UIAlert
            message="No logs match current filters"
            description="Adjust filters or wait for new logs to arrive"
            type="info"
            showIcon
          />
        ) : groupBy === 'none' ? (
          <div style={{ maxHeight: 600, overflow: 'auto' }}>
            <UIList
              dataSource={filteredLogs}
              renderItem={(log, index) => (
                <UIList.Item style={{ padding: '8px 0' }}>{renderLogItem(log, index)}</UIList.Item>
              )}
              pagination={
                filteredLogs.length > 50
                  ? {
                      pageSize: 50,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} logs`,
                      pageSizeOptions: ['25', '50', '100', '200'],
                    }
                  : false
              }
            />
          </div>
        ) : (
          renderGroupedLogs()
        )}
      </UICard>

      {/* AI Summarize Modal */}
      <UIModal
        title={
          <UISpace>
            <UIIcon name="RobotOutlined" />
            <span>AI Log Summarization</span>
          </UISpace>
        }
        open={summarizeModalOpen}
        onCancel={() => setSummarizeModalOpen(false)}
        width={800}
        footer={[
          <UIButton key="cancel" onClick={() => setSummarizeModalOpen(false)}>
            Cancel
          </UIButton>,
          <UIButton
            key="summarize"
            type="primary"
            icon={<UIIcon name="ThunderboltOutlined" />}
            loading={summarizing}
            onClick={handleSummarize}
            disabled={!customQuestion.trim()}
          >
            Generate Summary
          </UIButton>,
        ]}
      >
        <UISpace direction="vertical" style={{ width: '100%' }} size="large">
          {/* Data Preview */}
          <UICard size="small" style={{ backgroundColor: '#fafafa' }}>
            <UIRow gutter={16}>
              <UICol span={6}>
                <UITypographyText type="secondary">Logs to analyze:</UITypographyText>
                <div>
                  <UITypographyText strong>{filteredLogs.length}</UITypographyText>
                </div>
              </UICol>
              <UICol span={6}>
                <UITypographyText type="secondary">Errors:</UITypographyText>
                <div>
                  <UITypographyText type="danger" strong>
                    {stats.errorCount}
                  </UITypographyText>
                </div>
              </UICol>
              <UICol span={6}>
                <UITypographyText type="secondary">Warnings:</UITypographyText>
                <div>
                  <UITypographyText type="warning" strong>
                    {stats.warningCount}
                  </UITypographyText>
                </div>
              </UICol>
              <UICol span={6}>
                <UITypographyText type="secondary">Time range:</UITypographyText>
                <div>
                  <UITypographyText strong>{TIME_RANGES[timeRange as keyof typeof TIME_RANGES]?.label}</UITypographyText>
                </div>
              </UICol>
            </UIRow>
          </UICard>

          {/* Quick Templates */}
          <div>
            <UITypographyText strong>Quick Questions:</UITypographyText>
            <div style={{ marginTop: 8 }}>
              <UISpace wrap>
                {QUESTION_TEMPLATES.map((template) => (
                  <UIButton
                    key={template.label}
                    size="small"
                    onClick={() => setCustomQuestion(template.value)}
                  >
                    {template.label}
                  </UIButton>
                ))}
              </UISpace>
            </div>
          </div>

          <UIDivider style={{ margin: '8px 0' }} />

          {/* Custom Question */}
          <div>
            <UITypographyText strong>Your Question:</UITypographyText>
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
            <UITypographyText strong>Include in context:</UITypographyText>
            <div style={{ marginTop: 8 }}>
              <UISpace direction="vertical">
                <UICheckbox
                  checked={includeContext.errors}
                  onChange={(checked) =>
                    setIncludeContext({ ...includeContext, errors: checked })
                  }
                >
                  Error messages and stack traces
                </UICheckbox>
                <UICheckbox
                  checked={includeContext.warnings}
                  onChange={(checked) =>
                    setIncludeContext({ ...includeContext, warnings: checked })
                  }
                >
                  Warning messages
                </UICheckbox>
                <UICheckbox
                  checked={includeContext.info}
                  onChange={(checked) =>
                    setIncludeContext({ ...includeContext, info: checked })
                  }
                >
                  Info-level logs
                </UICheckbox>
                <UICheckbox
                  checked={includeContext.metadata}
                  onChange={(checked) =>
                    setIncludeContext({ ...includeContext, metadata: checked })
                  }
                >
                  Metadata (traceId, executionId, etc.)
                </UICheckbox>
                <UICheckbox
                  checked={includeContext.stackTraces}
                  onChange={(checked) =>
                    setIncludeContext({ ...includeContext, stackTraces: checked })
                  }
                >
                  Full stack traces
                </UICheckbox>
              </UISpace>
            </div>
          </div>

          {/* Summary Result */}
          {summarizing && (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <UISpin tip="Analyzing logs with AI..." size="large" />
            </div>
          )}

          {summaryResult && !summarizing && (
            <UISpace direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
              {/* Statistics Card */}
              <UICard
                title={
                  <UISpace>
                    <UIIcon name="InfoCircleOutlined" />
                    <span>Statistics</span>
                  </UISpace>
                }
                size="small"
              >
                <UIDescriptions column={2} size="small">
                  <UIDescriptionsItem label="Total Logs">{summaryResult.summary.total}</UIDescriptionsItem>
                  <UIDescriptionsItem label="Time Range">
                    {summaryResult.summary.timeRange.from && summaryResult.summary.timeRange.to
                      ? `${summaryResult.summary.timeRange.from} to ${summaryResult.summary.timeRange.to}`
                      : 'All time'}
                  </UIDescriptionsItem>
                </UIDescriptions>

                {/* Level breakdown */}
                {summaryResult.summary.stats?.byLevel && Object.keys(summaryResult.summary.stats.byLevel).length > 0 && (
                  <>
                    <UIDivider style={{ margin: '12px 0' }} />
                    <UITypographyText strong>By Level:</UITypographyText>
                    <div style={{ marginTop: 8 }}>
                      <UISpace wrap>
                        {Object.entries(summaryResult.summary.stats.byLevel).map(([level, count]) => (
                          <UITag key={level} color={
                            level === 'error' ? 'red' :
                            level === 'warn' ? 'orange' :
                            level === 'info' ? 'blue' :
                            'default'
                          }>
                            {level}: {count}
                          </UITag>
                        ))}
                      </UISpace>
                    </div>
                  </>
                )}

                {/* Plugin breakdown */}
                {summaryResult.summary.stats?.byPlugin && Object.keys(summaryResult.summary.stats.byPlugin).length > 0 && (
                  <>
                    <UIDivider style={{ margin: '12px 0' }} />
                    <UITypographyText strong>By Plugin (Top 5):</UITypographyText>
                    <div style={{ marginTop: 8 }}>
                      <UISpace wrap>
                        {Object.entries(summaryResult.summary.stats.byPlugin)
                          .sort((a: any, b: any) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([plugin, count]) => (
                            <UITag key={plugin}>{plugin}: {count}</UITag>
                          ))}
                      </UISpace>
                    </div>
                  </>
                )}
              </UICard>

              {/* Top Errors Card */}
              {summaryResult.summary.stats?.topErrors && summaryResult.summary.stats.topErrors.length > 0 && (
                <UICard
                  title={
                    <UISpace>
                      <UIIcon name="BugOutlined" />
                      <span>Top Errors</span>
                    </UISpace>
                  }
                  size="small"
                >
                  <UIList
                    size="small"
                    dataSource={summaryResult.summary.stats.topErrors.slice(0, 5)}
                    renderItem={(err: any, idx: number) => (
                      <UIList.Item>
                        <UITypographyText>
                          <UITypographyText type="secondary">{idx + 1}.</UITypographyText>{' '}
                          <UITypographyText code>{err.message}</UITypographyText>{' '}
                          <UITypographyText type="secondary">({err.count} times)</UITypographyText>
                        </UITypographyText>
                      </UIList.Item>
                    )}
                  />
                </UICard>
              )}

              {/* AI Analysis Card */}
              {summaryResult.aiSummary && (
                <UIAlert
                  type="info"
                  showIcon
                  icon={<UIIcon name="RobotOutlined" />}
                  message="AI Analysis"
                  description={
                    <UISpace direction="vertical" size="small" style={{ width: '100%' }}>
                      {summaryResult.aiSummary.split('\n\n').map((paragraph, idx) => (
                        <UITypographyParagraph key={idx} style={{ marginBottom: 0 }}>
                          {paragraph}
                        </UITypographyParagraph>
                      ))}
                    </UISpace>
                  }
                />
              )}

              {/* Info message if AI not available */}
              {!summaryResult.aiSummary && summaryResult.message && (
                <UIAlert
                  message={summaryResult.message}
                  type="info"
                  showIcon
                />
              )}
            </UISpace>
          )}
        </UISpace>
      </UIModal>
    </KBPageContainer>
  );
}
