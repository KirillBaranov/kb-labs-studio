/**
 * @module @kb-labs/studio-app/modules/agents/components/event-card
 * Card component for displaying agent events in Claude Code style
 */

import React from 'react';
import { Card, Tag, Typography, Space, Collapse, Progress, theme } from 'antd';
import { MarkdownViewer } from '@/components/markdown';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ToolOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  RocketOutlined,
  StopOutlined,
  SyncOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
  DatabaseOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { AgentEvent } from '@kb-labs/agent-contracts';

const { Text, Paragraph } = Typography;
const { useToken } = theme;

interface EventCardProps {
  event: AgentEvent;
  compact?: boolean;
}

/**
 * Format duration in ms to human readable
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {return `${ms}ms`;}
  if (ms < 60000) {return `${(ms / 1000).toFixed(1)}s`;}
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Format tokens count
 */
function formatTokens(tokens: number): string {
  if (tokens < 1000) {return tokens.toString();}
  return `${(tokens / 1000).toFixed(1)}k`;
}

/**
 * Truncate text with ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {return text;}
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get tool icon based on tool name
 */
function getToolIcon(toolName: string): React.ReactNode {
  if (toolName.startsWith('fs:') || toolName.includes('file') || toolName.includes('read') || toolName.includes('write')) {
    return <FileTextOutlined />;
  }
  if (toolName.includes('edit')) {
    return <EditOutlined />;
  }
  if (toolName.includes('search') || toolName.includes('grep') || toolName.includes('glob') || toolName.includes('rag')) {
    return <SearchOutlined />;
  }
  if (toolName.includes('bash') || toolName.includes('shell') || toolName.includes('exec')) {
    return <CodeOutlined />;
  }
  if (toolName.includes('memory')) {
    return <DatabaseOutlined />;
  }
  return <ToolOutlined />;
}

/**
 * Event styles configuration
 */
interface EventStyle {
  icon: React.ReactNode;
  color: string;
  title: string;
  showInCompact: boolean;
}

function getEventStyle(event: AgentEvent): EventStyle {
  switch (event.type) {
    // ═══════════════════════════════════════════════════════════════════════
    // Lifecycle Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'agent:start':
      return { icon: <RocketOutlined />, color: 'blue', title: 'Agent Started', showInCompact: true };
    case 'agent:end':
      return {
        icon: event.data.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
        color: event.data.success ? 'green' : 'red',
        title: event.data.success ? 'Completed' : 'Failed',
        showInCompact: true,
      };
    case 'agent:error':
      return { icon: <CloseCircleOutlined />, color: 'red', title: 'Error', showInCompact: true };

    // ═══════════════════════════════════════════════════════════════════════
    // Orchestrator Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'orchestrator:start':
      return { icon: <PlayCircleOutlined />, color: 'purple', title: 'Planning', showInCompact: true };
    case 'orchestrator:end':
      return {
        icon: event.data.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
        color: event.data.success ? 'green' : 'red',
        title: 'Plan Complete',
        showInCompact: true,
      };
    case 'subtask:start':
      return { icon: <PlayCircleOutlined />, color: 'cyan', title: `Subtask ${event.data.index + 1}/${event.data.total}`, showInCompact: true };
    case 'subtask:end':
      return {
        icon: event.data.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
        color: event.data.success ? 'success' : 'error',
        title: 'Subtask Done',
        showInCompact: false,
      };

    // ═══════════════════════════════════════════════════════════════════════
    // Iteration Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'iteration:start':
      return { icon: <SyncOutlined spin />, color: 'processing', title: `Step ${event.data.iteration}`, showInCompact: false };
    case 'iteration:end':
      return {
        icon: <CheckCircleOutlined />,
        color: 'default',
        title: `Step ${event.data.iteration} Done`,
        showInCompact: false,
      };

    // ═══════════════════════════════════════════════════════════════════════
    // LLM Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'llm:start':
      return { icon: <BulbOutlined />, color: 'purple', title: 'Thinking', showInCompact: true };
    case 'llm:chunk':
      return { icon: <LoadingOutlined spin />, color: 'processing', title: 'Streaming', showInCompact: false };
    case 'llm:end':
      return { icon: <BulbOutlined />, color: 'purple', title: 'Response', showInCompact: true };

    // ═══════════════════════════════════════════════════════════════════════
    // Tool Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'tool:start':
      return {
        icon: getToolIcon(event.data.toolName),
        color: 'processing',
        title: event.data.toolName,
        showInCompact: true,
      };
    case 'tool:end':
      return {
        icon: getToolIcon(event.data.toolName),
        color: event.data.success ? 'success' : 'error',
        title: event.data.toolName,
        showInCompact: true,
      };
    case 'tool:error':
      return {
        icon: <CloseCircleOutlined />,
        color: 'error',
        title: `${event.data.toolName} Error`,
        showInCompact: true,
      };

    // ═══════════════════════════════════════════════════════════════════════
    // Memory Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'memory:read':
      return { icon: <DatabaseOutlined />, color: 'cyan', title: 'Memory Read', showInCompact: false };
    case 'memory:write':
      return { icon: <DatabaseOutlined />, color: 'cyan', title: 'Memory Write', showInCompact: false };

    // ═══════════════════════════════════════════════════════════════════════
    // Progress Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'progress:update':
      return { icon: <LoadingOutlined spin />, color: 'processing', title: event.data.phase, showInCompact: true };
    case 'status:change':
      return getStatusStyle(event.data.status);

    default:
      return { icon: <ToolOutlined />, color: 'default', title: 'Event', showInCompact: false };
  }
}

function getStatusStyle(status: string): EventStyle {
  switch (status) {
    case 'thinking':
      return { icon: <BulbOutlined />, color: 'purple', title: 'Thinking', showInCompact: false };
    case 'executing':
      return { icon: <ThunderboltOutlined />, color: 'blue', title: 'Executing', showInCompact: false };
    case 'waiting':
      return { icon: <PauseCircleOutlined />, color: 'orange', title: 'Waiting', showInCompact: false };
    case 'done':
      return { icon: <CheckCircleOutlined />, color: 'green', title: 'Done', showInCompact: true };
    case 'error':
      return { icon: <CloseCircleOutlined />, color: 'red', title: 'Error', showInCompact: true };
    default:
      return { icon: <ClockCircleOutlined />, color: 'default', title: status, showInCompact: false };
  }
}

/**
 * Render event content based on type
 */
function EventContent({ event }: { event: AgentEvent }) {
  const { token } = useToken();

  switch (event.type) {
    // ═══════════════════════════════════════════════════════════════════════
    // Agent Lifecycle
    // ═══════════════════════════════════════════════════════════════════════
    case 'agent:start':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text style={{ fontSize: 13 }}>{event.data.task}</Text>
          <Space size={4} wrap>
            <Tag color="blue" style={{ margin: 0 }}>{event.data.tier}</Tag>
            <Tag style={{ margin: 0 }}>{event.data.toolCount} tools</Tag>
            <Tag style={{ margin: 0 }}>max {event.data.maxIterations} steps</Tag>
          </Space>
        </Space>
      );

    case 'agent:end':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Text style={{ fontSize: 13 }}>{event.data.summary}</Text>
          <Space size={8} wrap>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <ClockCircleOutlined /> {formatDuration(event.data.durationMs)}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTokens(event.data.tokensUsed)} tokens
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {event.data.iterations} steps
            </Text>
          </Space>
          {(event.data.filesCreated.length > 0 || event.data.filesModified.length > 0) && (
            <Space size={4} wrap>
              {event.data.filesCreated.length > 0 && (
                <Tag color="green" style={{ margin: 0 }}>+{event.data.filesCreated.length} files</Tag>
              )}
              {event.data.filesModified.length > 0 && (
                <Tag color="blue" style={{ margin: 0 }}>~{event.data.filesModified.length} files</Tag>
              )}
            </Space>
          )}
        </Space>
      );

    case 'agent:error':
      return (
        <Text type="danger" style={{ fontSize: 13 }}>
          {event.data.error}
          {event.data.recoverable && <Tag color="orange" style={{ marginLeft: 8 }}>Recoverable</Tag>}
        </Text>
      );

    // ═══════════════════════════════════════════════════════════════════════
    // Orchestrator
    // ═══════════════════════════════════════════════════════════════════════
    case 'orchestrator:start':
      return (
        <Space size={8}>
          <Text style={{ fontSize: 13 }}>{truncate(event.data.task, 100)}</Text>
          <Tag color={event.data.complexity === 'complex' ? 'orange' : 'green'} style={{ margin: 0 }}>
            {event.data.complexity}
          </Tag>
        </Space>
      );

    case 'orchestrator:end':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {event.data.summary && <Text style={{ fontSize: 13 }}>{event.data.summary}</Text>}
          <Space size={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {event.data.completedCount}/{event.data.subtaskCount} subtasks
            </Text>
            {event.data.durationMs && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined /> {formatDuration(event.data.durationMs)}
              </Text>
            )}
          </Space>
        </Space>
      );

    case 'subtask:start':
      return (
        <Text style={{ fontSize: 13 }}>{event.data.description}</Text>
      );

    case 'subtask:end':
      return event.data.summary ? (
        <Text style={{ fontSize: 13 }} type={event.data.success ? undefined : 'danger'}>
          {event.data.summary}
        </Text>
      ) : null;

    // ═══════════════════════════════════════════════════════════════════════
    // LLM Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'llm:start':
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {event.data.tier} tier • {event.data.messageCount} messages
        </Text>
      );

    case 'llm:end':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {event.data.content && (
            <div
              style={{
                padding: '8px 12px',
                background: token.colorBgContainer,
                borderRadius: token.borderRadius,
                border: `1px solid ${token.colorBorderSecondary}`,
                maxHeight: 300,
                overflow: 'auto',
              }}
            >
              <MarkdownViewer>{event.data.content}</MarkdownViewer>
            </div>
          )}
          <Space size={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTokens(event.data.tokensUsed)} tokens
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDuration(event.data.durationMs)}
            </Text>
            {event.data.hasToolCalls && (
              <Tag color="blue" style={{ margin: 0 }}>has tool calls</Tag>
            )}
          </Space>
        </Space>
      );

    case 'llm:chunk':
      return (
        <Text style={{ fontSize: 13, fontFamily: 'monospace' }}>{event.data.chunk}</Text>
      );

    // ═══════════════════════════════════════════════════════════════════════
    // Tool Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'tool:start':
      return (
        <ToolInputDisplay input={event.data.input} metadata={event.data.metadata} />
      );

    case 'tool:end':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={8}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDuration(event.data.durationMs)}
            </Text>
            {!event.data.success && <Tag color="error" style={{ margin: 0 }}>failed</Tag>}
          </Space>
          {event.data.output && (
            <ToolOutputDisplay
              output={event.data.output}
              success={event.data.success}
              metadata={event.data.metadata}
            />
          )}
        </Space>
      );

    case 'tool:error':
      return (
        <Text type="danger" style={{ fontSize: 13 }}>{event.data.error}</Text>
      );

    // ═══════════════════════════════════════════════════════════════════════
    // Iteration Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'iteration:start':
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Step {event.data.iteration} of {event.data.maxIterations}
        </Text>
      );

    case 'iteration:end':
      return (
        <Space size={8}>
          {event.data.hadToolCalls ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {event.data.toolCallCount} tool call{event.data.toolCallCount !== 1 ? 's' : ''}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>No tool calls</Text>
          )}
        </Space>
      );

    // ═══════════════════════════════════════════════════════════════════════
    // Memory Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'memory:read':
      return (
        <Text type="secondary" style={{ fontSize: 12 }}>
          Read {event.data.entryCount} entries from {event.data.source} memory
        </Text>
      );

    case 'memory:write':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Space size={8}>
            <Tag color="cyan" style={{ margin: 0 }}>{event.data.entryType}</Tag>
            <Tag style={{ margin: 0 }}>{event.data.target}</Tag>
          </Space>
          <Text style={{ fontSize: 13 }}>{truncate(event.data.content, 200)}</Text>
        </Space>
      );

    // ═══════════════════════════════════════════════════════════════════════
    // Progress Events
    // ═══════════════════════════════════════════════════════════════════════
    case 'progress:update':
      return (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          {event.data.message && <Text style={{ fontSize: 13 }}>{event.data.message}</Text>}
          <Progress
            percent={event.data.progress}
            size="small"
            status="active"
            style={{ margin: 0 }}
          />
        </Space>
      );

    case 'status:change':
      return event.data.message ? (
        <Text type="secondary" style={{ fontSize: 13 }}>{event.data.message}</Text>
      ) : null;

    default:
      return (
        <pre style={{ margin: 0, fontSize: 11, overflow: 'auto', maxHeight: 150 }}>
          {JSON.stringify((event as any).data, null, 2)}
        </pre>
      );
  }
}

/**
 * Display tool input in a readable format
 */
function ToolInputDisplay({ input, metadata }: { input: Record<string, unknown>; metadata?: any }) {
  const { token } = useToken();

  // Special handling for common input patterns
  if (input.file_path || input.filePath || input.path) {
    const path = (input.file_path || input.filePath || input.path) as string;
    return (
      <Text code style={{ fontSize: 12 }}>{path}</Text>
    );
  }

  if (input.pattern) {
    return (
      <Text code style={{ fontSize: 12 }}>{input.pattern as string}</Text>
    );
  }

  if (input.command) {
    return (
      <Text code style={{ fontSize: 12 }}>{truncate(input.command as string, 100)}</Text>
    );
  }

  if (input.query || input.text) {
    return (
      <Text style={{ fontSize: 12, fontStyle: 'italic' }}>
        "{truncate((input.query || input.text) as string, 100)}"
      </Text>
    );
  }

  // Fallback: show collapsible JSON
  const keys = Object.keys(input);
  if (keys.length === 0) {return null;}

  if (keys.length <= 2) {
    return (
      <Text type="secondary" style={{ fontSize: 12 }}>
        {keys.map(k => `${k}: ${truncate(String(input[k]), 30)}`).join(', ')}
      </Text>
    );
  }

  return (
    <Collapse
      size="small"
      ghost
      items={[{
        key: 'input',
        label: <Text type="secondary" style={{ fontSize: 11 }}>Show input</Text>,
        children: (
          <pre style={{ margin: 0, fontSize: 11, overflow: 'auto', maxHeight: 150 }}>
            {JSON.stringify(input, null, 2)}
          </pre>
        ),
      }]}
    />
  );
}

/**
 * Display tool output in a readable format
 */
function ToolOutputDisplay({ output, success, metadata }: { output: string; success: boolean; metadata?: any }) {
  const { token } = useToken();

  // If output is short, show inline
  if (output.length < 200) {
    return (
      <div
        style={{
          padding: '6px 10px',
          background: success ? token.colorSuccessBg : token.colorErrorBg,
          borderRadius: token.borderRadius,
          border: `1px solid ${success ? token.colorSuccessBorder : token.colorErrorBorder}`,
          fontSize: 12,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: 100,
          overflow: 'auto',
        }}
      >
        {output}
      </div>
    );
  }

  // Longer output in collapsible
  return (
    <Collapse
      size="small"
      ghost
      items={[{
        key: 'output',
        label: (
          <Text type={success ? 'success' : 'danger'} style={{ fontSize: 11 }}>
            {success ? 'Show output' : 'Show error'} ({output.length} chars)
          </Text>
        ),
        children: (
          <pre
            style={{
              margin: 0,
              fontSize: 11,
              overflow: 'auto',
              maxHeight: 200,
              padding: 8,
              background: success ? token.colorSuccessBg : token.colorErrorBg,
              borderRadius: token.borderRadius,
            }}
          >
            {output}
          </pre>
        ),
      }]}
    />
  );
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const { token } = useToken();
  const { icon, color, title, showInCompact } = getEventStyle(event);
  const timestamp = new Date(event.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // In compact mode, skip non-essential events
  if (compact && !showInCompact) {
    return null;
  }

  const isMinimal = ['status:change', 'iteration:start', 'iteration:end', 'llm:start', 'memory:read'].includes(event.type);

  return (
    <Card
      size="small"
      style={{
        marginBottom: 6,
        borderColor: token.colorBorderSecondary,
      }}
      styles={{
        body: { padding: isMinimal ? '8px 12px' : '10px 14px' },
      }}
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={6}>
            <Tag icon={icon} color={color} style={{ margin: 0 }}>
              {title}
            </Tag>
            {event.sessionId && event.type !== 'agent:start' && (
              <Text type="secondary" style={{ fontSize: 11 }}>{event.sessionId.slice(-8)}</Text>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {timestamp}
          </Text>
        </div>
        <EventContent event={event} />
      </Space>
    </Card>
  );
}
