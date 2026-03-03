/**
 * @module @kb-labs/studio-app/modules/agents/components/event-card
 * Card component for displaying agent events in Claude Code style
 */

import React from 'react';
import {
  UICard,
  UITag,
  UITypographyText,
  UITypographyParagraph,
  UISpace,
  UIAccordion,
  UIProgress,
  UIIcon,
  useUITheme,
} from '@kb-labs/studio-ui-kit';
import { MarkdownViewer } from '@/components/markdown';
import type { AgentEvent } from '@kb-labs/agent-contracts';

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
    return <UIIcon name="FileTextOutlined" />;
  }
  if (toolName.includes('edit')) {
    return <UIIcon name="EditOutlined" />;
  }
  if (toolName.includes('search') || toolName.includes('grep') || toolName.includes('glob') || toolName.includes('rag')) {
    return <UIIcon name="SearchOutlined" />;
  }
  if (toolName.includes('bash') || toolName.includes('shell') || toolName.includes('exec')) {
    return <UIIcon name="CodeOutlined" />;
  }
  if (toolName.includes('memory')) {
    return <UIIcon name="DatabaseOutlined" />;
  }
  return <UIIcon name="ToolOutlined" />;
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
    // Lifecycle Events
    case 'agent:start':
      return { icon: <UIIcon name="RocketOutlined" />, color: 'blue', title: 'Agent Started', showInCompact: true };
    case 'agent:end':
      return {
        icon: event.data.success ? <UIIcon name="CheckCircleOutlined" /> : <UIIcon name="CloseCircleOutlined" />,
        color: event.data.success ? 'green' : 'red',
        title: event.data.success ? 'Completed' : 'Failed',
        showInCompact: true,
      };
    case 'agent:error':
      return { icon: <UIIcon name="CloseCircleOutlined" />, color: 'red', title: 'Error', showInCompact: true };

    case 'subtask:start':
      return { icon: <UIIcon name="PlayCircleOutlined" />, color: 'cyan', title: `Subtask ${event.data.index + 1}/${event.data.total}`, showInCompact: true };
    case 'subtask:end':
      return {
        icon: event.data.success ? <UIIcon name="CheckCircleOutlined" /> : <UIIcon name="CloseCircleOutlined" />,
        color: event.data.success ? 'success' : 'error',
        title: 'Subtask Done',
        showInCompact: false,
      };

    // Iteration Events
    case 'iteration:start':
      return { icon: <UIIcon name="SyncOutlined" spin />, color: 'processing', title: `Step ${event.data.iteration}`, showInCompact: false };
    case 'iteration:end':
      return {
        icon: <UIIcon name="CheckCircleOutlined" />,
        color: 'default',
        title: `Step ${event.data.iteration} Done`,
        showInCompact: false,
      };

    // LLM Events
    case 'llm:start':
      return { icon: <UIIcon name="BulbOutlined" />, color: 'purple', title: 'Thinking', showInCompact: true };
    case 'llm:chunk':
      return { icon: <UIIcon name="LoadingOutlined" spin />, color: 'processing', title: 'Streaming', showInCompact: false };
    case 'llm:end':
      return { icon: <UIIcon name="BulbOutlined" />, color: 'purple', title: 'Response', showInCompact: true };

    // Tool Events
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
        icon: <UIIcon name="CloseCircleOutlined" />,
        color: 'error',
        title: `${event.data.toolName} Error`,
        showInCompact: true,
      };

    // Memory Events
    case 'memory:read':
      return { icon: <UIIcon name="DatabaseOutlined" />, color: 'cyan', title: 'Memory Read', showInCompact: false };
    case 'memory:write':
      return { icon: <UIIcon name="DatabaseOutlined" />, color: 'cyan', title: 'Memory Write', showInCompact: false };

    // Progress Events
    case 'progress:update':
      return { icon: <UIIcon name="LoadingOutlined" spin />, color: 'processing', title: event.data.phase, showInCompact: true };
    case 'status:change':
      return getStatusStyle(event.data.status);

    default:
      return { icon: <UIIcon name="ToolOutlined" />, color: 'default', title: 'Event', showInCompact: false };
  }
}

function getStatusStyle(status: string): EventStyle {
  switch (status) {
    case 'thinking':
      return { icon: <UIIcon name="BulbOutlined" />, color: 'purple', title: 'Thinking', showInCompact: false };
    case 'analyzing':
      return { icon: <UIIcon name="SearchOutlined" />, color: 'cyan', title: 'Analyzing', showInCompact: true };
    case 'planning':
      return { icon: <UIIcon name="FileTextOutlined" />, color: 'blue', title: 'Planning', showInCompact: true };
    case 'researching':
      return { icon: <UIIcon name="DatabaseOutlined" />, color: 'purple', title: 'Researching', showInCompact: true };
    case 'executing':
      return { icon: <UIIcon name="ThunderboltOutlined" />, color: 'blue', title: 'Executing', showInCompact: false };
    case 'finalizing':
      return { icon: <UIIcon name="EditOutlined" />, color: 'green', title: 'Finalizing', showInCompact: true };
    case 'waiting':
      return { icon: <UIIcon name="PauseCircleOutlined" />, color: 'orange', title: 'Waiting', showInCompact: false };
    case 'done':
      return { icon: <UIIcon name="CheckCircleOutlined" />, color: 'green', title: 'Done', showInCompact: true };
    case 'error':
      return { icon: <UIIcon name="CloseCircleOutlined" />, color: 'red', title: 'Error', showInCompact: true };
    default:
      return { icon: <UIIcon name="ClockCircleOutlined" />, color: 'default', title: status, showInCompact: false };
  }
}

/**
 * Render event content based on type
 */
function EventContent({ event }: { event: AgentEvent }) {
  const { token } = useUITheme();

  switch (event.type) {
    // Agent Lifecycle
    case 'agent:start':
      return (
        <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
          <UITypographyText style={{ fontSize: 13 }}>{event.data.task}</UITypographyText>
          <UISpace size={4} wrap>
            <UITag color="blue" style={{ margin: 0 }}>{event.data.tier}</UITag>
            <UITag style={{ margin: 0 }}>{event.data.toolCount} tools</UITag>
            <UITag style={{ margin: 0 }}>max {event.data.maxIterations} steps</UITag>
          </UISpace>
        </UISpace>
      );

    case 'agent:end':
      return (
        <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
          <UITypographyText style={{ fontSize: 13 }}>{event.data.summary}</UITypographyText>
          <UISpace size={8} wrap>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              <UIIcon name="ClockCircleOutlined" /> {formatDuration(event.data.durationMs)}
            </UITypographyText>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {formatTokens(event.data.tokensUsed)} tokens
            </UITypographyText>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {event.data.iterations} steps
            </UITypographyText>
          </UISpace>
          {(event.data.filesCreated.length > 0 || event.data.filesModified.length > 0) && (
            <UISpace size={4} wrap>
              {event.data.filesCreated.length > 0 && (
                <UITag color="green" style={{ margin: 0 }}>+{event.data.filesCreated.length} files</UITag>
              )}
              {event.data.filesModified.length > 0 && (
                <UITag color="blue" style={{ margin: 0 }}>~{event.data.filesModified.length} files</UITag>
              )}
            </UISpace>
          )}
        </UISpace>
      );

    case 'agent:error':
      return (
        <UITypographyText type="danger" style={{ fontSize: 13 }}>
          {event.data.error}
          {event.data.recoverable && <UITag color="orange" style={{ marginLeft: 8 }}>Recoverable</UITag>}
        </UITypographyText>
      );

    case 'subtask:start':
      return (
        <UITypographyText style={{ fontSize: 13 }}>{event.data.description}</UITypographyText>
      );

    case 'subtask:end':
      return event.data.summary ? (
        <UITypographyText style={{ fontSize: 13 }} type={event.data.success ? undefined : 'danger'}>
          {event.data.summary}
        </UITypographyText>
      ) : null;

    // LLM Events
    case 'llm:start':
      return (
        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
          {event.data.tier} tier - {event.data.messageCount} messages
        </UITypographyText>
      );

    case 'llm:end':
      return (
        <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
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
          <UISpace size={8}>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {formatTokens(event.data.tokensUsed)} tokens
            </UITypographyText>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {formatDuration(event.data.durationMs)}
            </UITypographyText>
            {event.data.hasToolCalls && (
              <UITag color="blue" style={{ margin: 0 }}>has tool calls</UITag>
            )}
          </UISpace>
        </UISpace>
      );

    case 'llm:chunk':
      return (
        <UITypographyText style={{ fontSize: 13, fontFamily: 'monospace' }}>{event.data.chunk}</UITypographyText>
      );

    // Tool Events
    case 'tool:start':
      return (
        <ToolInputDisplay input={event.data.input} metadata={event.data.metadata} />
      );

    case 'tool:end':
      return (
        <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
          <UISpace size={8}>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {formatDuration(event.data.durationMs)}
            </UITypographyText>
            {!event.data.success && <UITag color="error" style={{ margin: 0 }}>failed</UITag>}
          </UISpace>
          {event.data.output && (
            <ToolOutputDisplay
              output={event.data.output}
              success={event.data.success}
              metadata={event.data.metadata}
            />
          )}
        </UISpace>
      );

    case 'tool:error':
      return (
        <UITypographyText type="danger" style={{ fontSize: 13 }}>{event.data.error}</UITypographyText>
      );

    // Iteration Events
    case 'iteration:start':
      return (
        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
          Step {event.data.iteration} of {event.data.maxIterations}
        </UITypographyText>
      );

    case 'iteration:end':
      return (
        <UISpace size={8}>
          {event.data.hadToolCalls ? (
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {event.data.toolCallCount} tool call{event.data.toolCallCount !== 1 ? 's' : ''}
            </UITypographyText>
          ) : (
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>No tool calls</UITypographyText>
          )}
        </UISpace>
      );

    // Memory Events
    case 'memory:read':
      return (
        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
          Read {event.data.entryCount} entries from {event.data.source} memory
        </UITypographyText>
      );

    case 'memory:write':
      return (
        <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
          <UISpace size={8}>
            <UITag color="cyan" style={{ margin: 0 }}>{event.data.entryType}</UITag>
            <UITag style={{ margin: 0 }}>{event.data.target}</UITag>
          </UISpace>
          <UITypographyText style={{ fontSize: 13 }}>{truncate(event.data.content, 200)}</UITypographyText>
        </UISpace>
      );

    // Progress Events
    case 'progress:update':
      return (
        <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
          {event.data.message && <UITypographyText style={{ fontSize: 13 }}>{event.data.message}</UITypographyText>}
          <UIProgress
            percent={event.data.progress}
            size="small"
            status="active"
            style={{ margin: 0 }}
          />
        </UISpace>
      );

    case 'status:change':
      return event.data.message ? (
        <UITypographyText type="secondary" style={{ fontSize: 13 }}>{event.data.message}</UITypographyText>
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
  const { token } = useUITheme();

  // Special handling for common input patterns
  if (input.file_path || input.filePath || input.path) {
    const path = (input.file_path || input.filePath || input.path) as string;
    return (
      <UITypographyText code style={{ fontSize: 12 }}>{path}</UITypographyText>
    );
  }

  if (input.pattern) {
    return (
      <UITypographyText code style={{ fontSize: 12 }}>{input.pattern as string}</UITypographyText>
    );
  }

  if (input.command) {
    return (
      <UITypographyText code style={{ fontSize: 12 }}>{truncate(input.command as string, 100)}</UITypographyText>
    );
  }

  if (input.query || input.text) {
    return (
      <UITypographyText style={{ fontSize: 12, fontStyle: 'italic' }}>
        "{truncate((input.query || input.text) as string, 100)}"
      </UITypographyText>
    );
  }

  // Fallback: show collapsible JSON
  const keys = Object.keys(input);
  if (keys.length === 0) {return null;}

  if (keys.length <= 2) {
    return (
      <UITypographyText type="secondary" style={{ fontSize: 12 }}>
        {keys.map(k => `${k}: ${truncate(String(input[k]), 30)}`).join(', ')}
      </UITypographyText>
    );
  }

  return (
    <UIAccordion
      size="small"
      ghost
      items={[{
        key: 'input',
        label: 'Show input',
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
  const { token } = useUITheme();

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
    <UIAccordion
      size="small"
      ghost
      items={[{
        key: 'output',
        label: `${success ? 'Show output' : 'Show error'} (${output.length} chars)`,
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
  const { token } = useUITheme();
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
    <UICard
      size="small"
      style={{
        marginBottom: 6,
        borderColor: token.colorBorderSecondary,
      }}
      styles={{
        body: { padding: isMinimal ? '8px 12px' : '10px 14px' },
      }}
    >
      <UISpace direction="vertical" size={4} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <UISpace size={6}>
            <UITag icon={icon} color={color} style={{ margin: 0 }}>
              {title}
            </UITag>
            {event.sessionId && event.type !== 'agent:start' && (
              <UITypographyText type="secondary" style={{ fontSize: 11 }}>{event.sessionId.slice(-8)}</UITypographyText>
            )}
          </UISpace>
          <UITypographyText type="secondary" style={{ fontSize: 11 }}>
            {timestamp}
          </UITypographyText>
        </div>
        <EventContent event={event} />
      </UISpace>
    </UICard>
  );
}
