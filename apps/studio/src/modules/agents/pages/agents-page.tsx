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
import { SessionSelector } from '../components/session-selector';
import { ResearchBlock } from '../components/research-block';
import { AnswerBlock } from '../components/answer-block';
import type { ResearchStep } from '../components/step-item';
import type { ToolCall } from '../components/tool-item';
import type { AgentEvent, AgentSessionInfo } from '@kb-labs/agent-contracts';
import './agents-page.css';

const { Text } = Typography;

type RunStatus = 'idle' | 'running' | 'completed' | 'failed' | 'stopped';

interface ConversationTurn {
  id: string;
  userMessage: string;
  timestamp: string;
  steps: ResearchStep[];
  answer?: string;
  isRunning: boolean;
}

/**
 * Build conversation turns from events
 * Groups events by orchestrator:start → orchestrator:end
 */
function buildConversationTurns(events: AgentEvent[]): ConversationTurn[] {
  const turns: ConversationTurn[] = [];
  let currentTurn: ConversationTurn | null = null;

  // Maps for correlation
  const stepsByAgentId = new Map<string, ResearchStep>();
  const toolsByCallId = new Map<string, ToolCall>();

  for (const event of events) {
    // New conversation turn starts with orchestrator:start
    if (event.type === 'orchestrator:start') {
      // Save previous turn if exists
      if (currentTurn) {
        turns.push(currentTurn);
      }
      currentTurn = {
        id: `turn-${event.timestamp}`,
        userMessage: event.data.task,
        timestamp: event.timestamp,
        steps: [],
        isRunning: true,
      };
      // Reset maps for new turn
      stepsByAgentId.clear();
      toolsByCallId.clear();
      continue;
    }

    // Skip events without a current turn
    if (!currentTurn) {continue;}

    // Child agent starts (research step)
    if (event.type === 'agent:start' && event.parentAgentId) {
      const step: ResearchStep = {
        id: event.agentId || `step-${event.timestamp}`,
        task: event.data.task,
        status: 'running',
        tools: [],
      };
      stepsByAgentId.set(step.id, step);
      currentTurn.steps.push(step);
      continue;
    }

    // Child agent ends
    if (event.type === 'agent:end' && event.agentId && stepsByAgentId.has(event.agentId)) {
      const step = stepsByAgentId.get(event.agentId)!;
      step.status = event.data.success ? 'done' : 'error';
      step.duration = event.data.durationMs;
      if (!event.data.success) {
        step.error = event.data.summary;
      }
      continue;
    }

    // Agent error
    if (event.type === 'agent:error' && event.agentId && stepsByAgentId.has(event.agentId)) {
      const step = stepsByAgentId.get(event.agentId)!;
      step.status = 'error';
      step.error = event.data.error;
      continue;
    }

    // Tool starts
    if (event.type === 'tool:start' && event.agentId) {
      const step = stepsByAgentId.get(event.agentId);
      if (step) {
        const tool: ToolCall = {
          id: event.toolCallId || `tool-${event.timestamp}`,
          name: event.data.toolName,
          status: 'running',
          preview: '',
          input: event.data.input,
        };
        toolsByCallId.set(tool.id, tool);
        step.tools.push(tool);
      }
      continue;
    }

    // Tool ends
    if (event.type === 'tool:end' && event.toolCallId) {
      const tool = toolsByCallId.get(event.toolCallId);
      if (tool) {
        tool.status = event.data.success ? 'done' : 'error';
        tool.output = event.data.output;
        tool.preview = generateToolPreview(event.data.toolName, event.data.output);
      }
      continue;
    }

    // Tool error
    if (event.type === 'tool:error' && event.toolCallId) {
      const tool = toolsByCallId.get(event.toolCallId);
      if (tool) {
        tool.status = 'error';
        tool.error = event.data.error;
      }
      continue;
    }

    // LLM end - capture agent thoughts/reasoning (from child agents only)
    if (event.type === 'llm:end' && event.agentId && stepsByAgentId.has(event.agentId)) {
      const content = event.data.content;
      // Only capture meaningful thoughts (not just "[Executing tools...]" markers)
      if (content && content.length > 50 && !content.startsWith('[Executing')) {
        const step = stepsByAgentId.get(event.agentId)!;
        if (!step.thoughts) {
          step.thoughts = [];
        }
        // Only add if it's different from the last thought (avoid duplicates)
        const lastThought = step.thoughts[step.thoughts.length - 1];
        if (lastThought !== content) {
          step.thoughts.push(content);
        }
      }
      continue;
    }

    // Orchestrator answer - capture synthesized response
    if (event.type === 'orchestrator:answer') {
      currentTurn.answer = event.data.answer;
      continue;
    }

    // Orchestrator ends - mark turn as complete
    if (event.type === 'orchestrator:end') {
      currentTurn.isRunning = false;
      continue;
    }
  }

  // Don't forget the last turn
  if (currentTurn) {
    turns.push(currentTurn);
  }

  return turns;
}

/**
 * Generate preview text for tool output
 */
function generateToolPreview(toolName: string, output?: string): string {
  if (!output) {return 'done';}

  const baseName = toolName.split(':').pop() || toolName;

  switch (baseName) {
    case 'read': {
      const lines = output.split('\n').length;
      return `${lines} lines`;
    }
    case 'rag-query': {
      const match = output.match(/Found (\d+)/i) || output.match(/(\d+) result/i);
      return match ? `${match[1]} results` : 'done';
    }
    case 'glob': {
      const files = output.split('\n').filter(Boolean).length;
      return `${files} files`;
    }
    case 'grep': {
      const matches = output.split('\n').filter(Boolean).length;
      return `${matches} matches`;
    }
    default:
      return 'done';
  }
}

export function AgentsPage() {
  const sources = useDataSources();
  const { token } = theme.useToken();
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
  // Note: Large limit to ensure we get all events including orchestrator:answer at the end
  const sessionEventsQuery = useAgentSessionEvents(
    sources.agent,
    currentSessionId,
    { limit: 1000, enabled: !!currentSessionId }
  );

  // Mutations
  const startRunMutation = useAgentStartRun(sources.agent);
  const stopMutation = useAgentStop(sources.agent);

  // Fallback summary from run:completed (when orchestrator:end not in events yet)
  const [fallbackSummary, setFallbackSummary] = useState<string | null>(null);

  // WebSocket connection for real-time events
  const ws = useAgentWebSocket({
    url: eventsUrl,
    onComplete: (success, summary) => {
      setRunStatus(success ? 'completed' : 'failed');
      // Store summary as fallback (in case orchestrator:end event not captured)
      if (summary) {
        setFallbackSummary(summary);
        console.log('[AgentsPage] run:completed summary:', summary.slice(0, 100) + '...');
      }
      // Refetch session events to get persisted history
      void sessionEventsQuery.refetch();
    },
    onError: (error) => {
      console.error('[AgentsPage] WebSocket error:', error);
      message.error(`Connection error: ${error.message}`);
    },
  });

  // Clear stale events on mount (fresh start)
  useEffect(() => {
    ws.clearEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!task.trim()) {return;}

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
    if (!currentRunId) {return;}

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
  const historicalEvents = currentSessionId ? (sessionEventsQuery.data?.events ?? []) : [];
  const liveEvents = ws.events;

  // Generate unique event ID for deduplication
  const getEventId = (e: AgentEvent): string => {
    const base = `${e.type}-${e.timestamp}`;
    const agentPart = e.agentId ? `-${e.agentId}` : '';
    const toolPart = e.toolCallId ? `-${e.toolCallId}` : '';
    return `${base}${agentPart}${toolPart}`;
  };

  // Deduplicate: use historical events + any new live events not in history
  const historicalIds = new Set(historicalEvents.map(getEventId));
  const newLiveEvents = liveEvents.filter((e) => !historicalIds.has(getEventId(e)));

  // Merge and sort by seq (primary) or timestamp (fallback)
  const allEvents = [...historicalEvents, ...newLiveEvents].sort((a, b) => {
    // Primary: sort by seq if both have it
    if (a.seq !== undefined && b.seq !== undefined) {
      return a.seq - b.seq;
    }
    // Fallback: sort by timestamp
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  // Build conversation turns from events
  const turns = buildConversationTurns(allEvents);

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
          {turns.length === 0 && !isRunning && (
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

          {/* Conversation turns */}
          {turns.map((turn) => (
            <div key={turn.id} style={{ marginBottom: 24 }}>
              {/* User message */}
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
                  {turn.userMessage}
                </div>
              </div>

              {/* Agent response */}
              <div
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {/* Research steps */}
                <ResearchBlock
                  steps={turn.steps}
                  isRunning={turn.isRunning}
                />

                {/* Final answer */}
                {turn.answer && (
                  <AnswerBlock content={turn.answer} />
                )}

                {/* Loading state when no answer yet */}
                {turn.isRunning && !turn.answer && turn.steps.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <Space>
                      <LoadingOutlined style={{ color: token.colorPrimary }} />
                      <Text type="secondary">Synthesizing answer...</Text>
                    </Space>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Initial loading state (before any steps) */}
          {isRunning && turns.length > 0 && turns[turns.length - 1].steps.length === 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                color: token.colorTextSecondary,
              }}
            >
              <LoadingOutlined style={{ color: token.colorPrimary }} />
              <Text type="secondary">Planning research...</Text>
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
