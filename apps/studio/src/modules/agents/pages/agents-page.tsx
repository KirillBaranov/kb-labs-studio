/**
 * @module @kb-labs/studio-app/modules/agents/pages/agents-page
 * Claude Code style chat UI for Agent execution with session support
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Input, Button, Space, Typography, message, theme, Card } from 'antd';
import { SendOutlined, StopOutlined, LoadingOutlined, RobotOutlined } from '@ant-design/icons';
import {
  useAgentStartRun,
  useAgentStop,
  useAgentWebSocket,
  useAgentSessionEvents,
} from '@kb-labs/studio-data-client';
import { useDataSources } from '@/providers/data-sources-provider';
import { MarkdownViewer } from '@/components/markdown';
import { SessionSelector } from '../components/session-selector';
import { ToolCallItem } from '../components/tool-call-item';
import type { AgentEvent, AgentSessionInfo } from '@kb-labs/agent-contracts';
import './agents-page.css';

const { Text } = Typography;
const { useToken } = theme;

type RunStatus = 'idle' | 'running' | 'completed' | 'failed' | 'stopped';

type MessageType = 'user' | 'agent' | 'tool' | 'error';

interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  timestamp: string;
  toolName?: string;
  toolInput?: Record<string, unknown>;
}

/**
 * Extract displayable messages from events
 *
 * Note: Events may arrive out of order due to parallel tool execution.
 * We use tool:end as the primary source (has output), and try to find
 * matching tool:start for input metadata.
 */
function getMessages(events: AgentEvent[]): ChatMessage[] {
  const messages: ChatMessage[] = [];

  // Build a map of tool:start events by toolName for input lookup
  // Since multiple calls to same tool are possible, we use an array
  const toolStartInputs = new Map<string, Array<Record<string, unknown>>>();

  for (const event of events) {
    if (event.type === 'tool:start') {
      const inputs = toolStartInputs.get(event.data.toolName) || [];
      inputs.push(event.data.input || {});
      toolStartInputs.set(event.data.toolName, inputs);
    }
  }

  // Track which tool:start inputs we've consumed (by tool name)
  const consumedInputs = new Map<string, number>();

  for (const event of events) {
    // User task (from agent:start)
    if (event.type === 'agent:start') {
      messages.push({
        id: `user-${event.timestamp}`,
        content: event.data.task,
        type: 'user',
        timestamp: event.timestamp,
      });
    }

    // Tool usage - use tool:end as primary (it always has output)
    if (event.type === 'tool:end') {
      const toolName = event.data.toolName;

      // Try to get input from matching tool:start
      const inputs = toolStartInputs.get(toolName) || [];
      const consumedCount = consumedInputs.get(toolName) || 0;
      const toolInput = inputs[consumedCount];
      consumedInputs.set(toolName, consumedCount + 1);

      messages.push({
        id: `tool-${event.timestamp}`,
        content: event.data.output || '',
        type: 'tool',
        timestamp: event.timestamp,
        toolName,
        toolInput,
      });
    }

    // LLM responses (agent thinking/answers)
    if (event.type === 'llm:end' && event.data.content) {
      messages.push({
        id: `agent-${event.timestamp}`,
        content: event.data.content,
        type: 'agent',
        timestamp: event.timestamp,
      });
    }

    // Errors
    if (event.type === 'agent:error') {
      messages.push({
        id: `error-${event.timestamp}`,
        content: event.data.error,
        type: 'error',
        timestamp: event.timestamp,
      });
    }
  }

  return messages;
}

export function AgentsPage() {
  const sources = useDataSources();
  const { token } = useToken();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Session state
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Run state
  const [task, setTask] = useState('');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [eventsUrl, setEventsUrl] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');

  // Hardcoded agent for simplicity
  const agentId = 'mind-assistant';

  // Fetch session history when session changes
  const sessionEventsQuery = useAgentSessionEvents(
    sources.agent,
    currentSessionId,
    { limit: 200, enabled: !!currentSessionId }
  );

  // Mutations
  const startRunMutation = useAgentStartRun(sources.agent);
  const stopMutation = useAgentStop(sources.agent);

  // WebSocket connection for real-time events
  const ws = useAgentWebSocket({
    url: eventsUrl,
    onComplete: (success) => {
      setRunStatus(success ? 'completed' : 'failed');
      // Refetch session events to get persisted history
      void sessionEventsQuery.refetch();
    },
    onError: (error) => {
      console.error('[AgentsPage] WebSocket error:', error);
      message.error(`Connection error: ${error.message}`);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ws.events, sessionEventsQuery.data]);

  // Session handlers
  const handleSessionChange = useCallback((sessionId: string, _session: AgentSessionInfo) => {
    setCurrentSessionId(sessionId);
    setCurrentRunId(null);
    setEventsUrl(null);
    setRunStatus('idle');
    ws.clearEvents();
  }, [ws]);

  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setCurrentRunId(null);
    setEventsUrl(null);
    setRunStatus('idle');
    ws.clearEvents();
  }, [ws]);

  // Run handlers
  const handleStart = useCallback(async () => {
    if (!task.trim()) return;

    try {
      setRunStatus('running');

      const response = await startRunMutation.mutateAsync({
        task: task.trim(),
        agentId,
        sessionId: currentSessionId ?? undefined,
      });

      // If we didn't have a session, use the one created by the run
      if (!currentSessionId) {
        setCurrentSessionId(response.sessionId);
      }

      setCurrentRunId(response.runId);
      setEventsUrl(response.eventsUrl);
      setTask('');
    } catch (error) {
      setRunStatus('failed');
      message.error(`Failed to start: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [task, agentId, currentSessionId, startRunMutation]);

  const handleStop = useCallback(async () => {
    if (!currentRunId) return;

    try {
      await stopMutation.mutateAsync({ runId: currentRunId, reason: 'Stopped by user' });
      setRunStatus('stopped');
      message.info('Stopped');
    } catch (error) {
      message.error(`Failed to stop: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [currentRunId, stopMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && runStatus !== 'running' && !startRunMutation.isPending) {
      e.preventDefault();
      handleStart();
    }
  };

  // Block input when running OR when mutation is in progress (prevents double-submit)
  const isRunning = runStatus === 'running' || startRunMutation.isPending;

  // Combine historical events with live WebSocket events
  const historicalEvents = sessionEventsQuery.data?.events ?? [];
  const liveEvents = ws.events;

  // Deduplicate: use historical events + any new live events not in history
  const historicalIds = new Set(historicalEvents.map((e) => `${e.type}-${e.timestamp}`));
  const newLiveEvents = liveEvents.filter(
    (e) => !historicalIds.has(`${e.type}-${e.timestamp}`)
  );
  const allEvents = [...historicalEvents, ...newLiveEvents];
  const messages = getMessages(allEvents);

  return (
    <div style={{ padding: 16, height: '100%' }}>
      <Card
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <RobotOutlined />
              <span>Agent</span>
            </Space>
          </Space>
        }
        extra={
          <SessionSelector
            agentId={agentId}
            currentSessionId={currentSessionId}
            onSessionChange={handleSessionChange}
            onNewChat={handleNewChat}
          />
        }
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
          },
        }}
      >
        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px 20px',
          }}
        >
          {messages.length === 0 && !isRunning && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: token.colorTextSecondary,
              }}
            >
              <Text type="secondary" style={{ fontSize: 16 }}>
                {currentSessionId
                  ? 'Continue the conversation...'
                  : 'Start a new conversation...'}
              </Text>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'user' ? (
                /* User message - bubble on the right */
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: 16,
                      background: token.colorPrimary,
                      color: '#fff',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ) : msg.type === 'tool' ? (
                /* Tool usage - with timeline dot */
                <div
                  style={{
                    position: 'relative',
                    paddingLeft: 24,
                    marginBottom: 8,
                  }}
                >
                  {/* Vertical line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 0,
                      bottom: -8,
                      width: 2,
                      background: token.colorBorderSecondary,
                    }}
                  />
                  {/* Small dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 2,
                      top: 6,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: token.colorBorderSecondary,
                      zIndex: 1,
                    }}
                  />
                  <ToolCallItem
                    toolName={msg.toolName || 'unknown'}
                    input={msg.toolInput}
                    output={msg.content}
                  />
                </div>
              ) : msg.type === 'error' ? (
                /* Error message */
                <div
                  style={{
                    position: 'relative',
                    paddingLeft: 24,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 0,
                      bottom: -16,
                      width: 2,
                      background: token.colorError,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: token.colorError,
                      zIndex: 1,
                    }}
                  />
                  <Text type="danger">{msg.content}</Text>
                </div>
              ) : (
                /* Agent message - timeline style */
                <div
                  style={{
                    position: 'relative',
                    paddingLeft: 24,
                    marginBottom: 16,
                    marginTop: 8,
                  }}
                >
                  {/* Vertical line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 5,
                      top: 0,
                      bottom: -16,
                      width: 2,
                      background: token.colorBorderSecondary,
                    }}
                  />
                  {/* Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: token.colorBgContainer,
                      border: `2px solid ${token.colorBorderSecondary}`,
                      zIndex: 1,
                    }}
                  />
                  <MarkdownViewer className="chat-message-markdown">{msg.content}</MarkdownViewer>
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {isRunning && (
            <div
              style={{
                position: 'relative',
                paddingLeft: 24,
              }}
            >
              {/* Vertical line */}
              <div
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 0,
                  height: 20,
                  width: 2,
                  background: token.colorBorderSecondary,
                }}
              />
              {/* Animated dot */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: token.colorPrimary,
                  border: `2px solid ${token.colorPrimary}`,
                  zIndex: 1,
                }}
              />
              <Space>
                <LoadingOutlined spin style={{ color: token.colorPrimary }} />
                <Text type="secondary">Thinking...</Text>
              </Space>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: '12px 16px',
            background: token.colorBgContainer,
          }}
        >
          <Space.Compact style={{ width: '100%' }}>
            <Input.TextArea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              disabled={isRunning}
              style={{
                borderRadius: '8px 0 0 8px',
                resize: 'none',
              }}
            />
            {isRunning ? (
              <Button
                danger
                icon={stopMutation.isPending ? <LoadingOutlined /> : <StopOutlined />}
                onClick={handleStop}
                disabled={stopMutation.isPending}
                style={{ height: 'auto', borderRadius: '0 8px 8px 0' }}
              >
                Stop
              </Button>
            ) : (
              <Button
                type="primary"
                icon={startRunMutation.isPending ? <LoadingOutlined /> : <SendOutlined />}
                onClick={handleStart}
                disabled={!task.trim() || startRunMutation.isPending}
                style={{ height: 'auto', borderRadius: '0 8px 8px 0' }}
              >
                Send
              </Button>
            )}
          </Space.Compact>
        </div>
      </Card>
    </div>
  );
}
