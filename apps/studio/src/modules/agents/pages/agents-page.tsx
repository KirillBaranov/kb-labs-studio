/**
 * @module @kb-labs/studio-app/modules/agents/pages/agents-page
 * Turn-based Agent chat UI with snapshot-based architecture
 *
 * NEW (Phase 2): Simple rendering of ready-made Turn snapshots from backend
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  UIInput, UIInputTextArea,
  UIButton,
  UISpace,
  UIMessage,
  UICard,
  UISelect,
  UISwitch,
  UITypographyText,
  UIIcon,
  useUITheme,
} from '@kb-labs/studio-ui-kit';
import { useSearchParams } from 'react-router-dom';
import {
  useAgentStartRun,
  useAgentStop,
  useAgentWebSocket,
  useSessionTurns,
} from '@kb-labs/studio-data-client';
import { useDataSources } from '@/providers/data-sources-provider';
import { SessionSelector } from '../components/session-selector';
import { ConversationView } from '../components/conversation-view';
import type { AgentSessionInfo, Turn, AgentResponseMode } from '@kb-labs/agent-contracts';
import './agents-page.css';

type RunStatus = 'idle' | 'running' | 'completed' | 'failed' | 'stopped';

function compareTurns(a: Turn, b: Turn): number {
  if (a.sequence !== b.sequence) {
    return a.sequence - b.sequence;
  }
  if (a.type !== b.type) {
    if (a.type === 'user') {
      return -1;
    }
    if (b.type === 'user') {
      return 1;
    }
  }
  return a.startedAt.localeCompare(b.startedAt);
}


export function AgentsPage() {
  const sources = useDataSources();
  const { token } = useUITheme();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Session state -- synced with URL search param ?session=
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    () => searchParams.get('session')
  );

  // Track which session's data is actually loaded and safe to display.
  // While switching sessions we show a loader instead of stale data from the previous session.
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(
    () => searchParams.get('session')
  );

  // Run state
  const [task, setTask] = useState('');
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  // Optimistic user turns — shown immediately on send, replaced by server turns when they arrive
  const [optimisticUserTurns, setOptimisticUserTurns] = useState<Turn[]>([]);
  const [responseMode, setResponseMode] = useState<AgentResponseMode>('auto');
  const [tier, setTier] = useState<'small' | 'medium' | 'large'>('medium');
  const [enableEscalation, setEnableEscalation] = useState(true);
  const [agentMode, setAgentMode] = useState<'execute' | 'plan'>('execute');

  // WS URL is session-level -- built from sessionId, not runId
  const eventsUrl = currentSessionId
    ? sources.agent.getEventsUrl(currentSessionId)
    : null;

  // Hardcoded agent for simplicity
  const agentId = 'mind-assistant';

  // Mutations
  const startRunMutation = useAgentStartRun(sources.agent);
  const stopMutation = useAgentStop(sources.agent);

  // REST: initial history load while WS is still connecting
  const sessionTurnsQuery = useSessionTurns(
    sources.agent,
    currentSessionId,
    { enabled: !!currentSessionId }
  );

  // Mark session as loaded once REST data arrives for the current session
  useEffect(() => {
    if (currentSessionId && sessionTurnsQuery.data && !sessionTurnsQuery.isFetching) {
      setLoadedSessionId(currentSessionId);
    }
  }, [currentSessionId, sessionTurnsQuery.data, sessionTurnsQuery.isFetching]);

  // WebSocket connection for turn snapshots (session-level, persistent)
  const ws = useAgentWebSocket({
    url: eventsUrl,
    onComplete: (success, summary) => {
      setRunStatus(success ? 'completed' : 'failed');
      // Hard sync after run finishes to get final persisted state
      void sessionTurnsQuery.refetch();
      console.log('[AgentsPage] Run completed:', summary);
    },
    onTurnsChanged: () => {
      // Once server turns arrive, drop optimistic ones (server is source of truth)
      setOptimisticUserTurns([]);
    },
    onError: (error) => {
      console.error('[AgentsPage] WebSocket error:', error);
      UIMessage.error(`Connection error: ${error.message}`);
    },
  });

  // Session handlers
  const handleSessionChange = useCallback((sessionId: string, _session: AgentSessionInfo) => {
    setCurrentSessionId(sessionId);
    setLoadedSessionId(null); // show loader until new session data arrives
    setSearchParams({ session: sessionId }, { replace: true });
    setCurrentRunId(null);
    setRunStatus('idle');
    setOptimisticUserTurns([]);
    ws.clearTurns();
  }, [ws, setSearchParams]);

  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setLoadedSessionId(null);
    setSearchParams({}, { replace: true });
    setCurrentRunId(null);
    setRunStatus('idle');
    setOptimisticUserTurns([]);
    ws.clearTurns();
  }, [ws, setSearchParams]);

  // Run handlers
  const handleStart = useCallback(async () => {
    if (!task.trim()) {return;}

    const userMessage = task.trim();
    setTask('');
    setRunStatus('running');

    // Optimistically show user message immediately — replaced by server turn when WS arrives
    const optimisticTurn: Turn = {
      id: `optimistic-user-${Date.now()}`,
      type: 'user',
      sequence: 9999,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      status: 'completed',
      steps: [{ type: 'text', id: 'opt-1', timestamp: new Date().toISOString(), content: userMessage, role: 'user' }],
      metadata: { agentId: 'user' },
    };
    setOptimisticUserTurns((prev) => [...prev, optimisticTurn]);

    try {
      const response = await startRunMutation.mutateAsync({
        task: userMessage,
        agentId,
        sessionId: currentSessionId ?? undefined,
        tier,
        enableEscalation,
        responseMode,
      });

      // If we didn't have a session, use the one created by the run
      if (!currentSessionId) {
        setCurrentSessionId(response.sessionId);
        setLoadedSessionId(response.sessionId); // new session, WS will be the source of truth
        setSearchParams({ session: response.sessionId }, { replace: true });
      }

      setCurrentRunId(response.runId);
    } catch (error) {
      setOptimisticUserTurns((prev) => prev.filter((t) => t.id !== optimisticTurn.id));
      setRunStatus('failed');
      UIMessage.error(`Failed to start: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [
    task,
    agentId,
    currentSessionId,
    tier,
    enableEscalation,
    responseMode,
    setSearchParams,
    startRunMutation,
  ]);

  const handleStop = useCallback(async () => {
    if (!currentRunId) {return;}

    try {
      await stopMutation.mutateAsync({ runId: currentRunId, reason: 'Stopped by user' });
      setRunStatus('stopped');
      UIMessage.info('Stopped');
    } catch (error) {
      UIMessage.error(`Failed to stop: ${error instanceof Error ? error.message : String(error)}`);
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

  // Whether we're in the middle of switching sessions -- show loader, hide stale data
  const isSwitchingSession = currentSessionId !== null && currentSessionId !== loadedSessionId;

  // Merge REST history + live WS turns, but ONLY when both belong to the current session.
  // While switching sessions we show nothing (loader) to avoid cross-session flicker.
  const turns = (() => {
    if (isSwitchingSession) {return [];}

    const restTurns = sessionTurnsQuery.data?.turns ?? [];
    const wsTurns = ws.turns;

    // Base merge: REST + WS (WS wins on conflict)
    const merged = new Map<string, Turn>();
    if (wsTurns.length === 0) {
      for (const t of restTurns) {merged.set(t.id, t);}
    } else {
      for (const t of restTurns) {merged.set(t.id, t);}
      for (const t of wsTurns) {merged.set(t.id, t);}
    }

    // Add optimistic user turns that don't have a matching real user turn yet.
    // A real turn "matches" when a server user turn with the same text exists.
    const serverUserTexts = new Set(
      [...merged.values()]
        .filter((t) => t.type === 'user')
        .flatMap((t) => t.steps.filter((s) => s.type === 'text').map((s) => s.content?.trim()))
        .filter(Boolean)
    );
    for (const t of optimisticUserTurns) {
      const text = t.steps.find((s) => s.type === 'text')?.content?.trim();
      if (text && !serverUserTexts.has(text)) {
        merged.set(t.id, t);
      }
    }

    return [...merged.values()].sort(compareTurns);
  })();

  const turnsWithThinkingLoader: Turn[] = (() => {
    if (!isRunning) {
      return turns;
    }

    const hasActiveAssistant = turns.some((t) => t.type === 'assistant' && t.status === 'streaming');
    if (hasActiveAssistant) {
      return turns;
    }

    // Don't show loader if the last assistant turn (after the last user turn) is already completed
    const lastUserTurn = [...turns].reverse().find((t) => t.type === 'user');
    if (!lastUserTurn) {
      return turns;
    }
    const hasCompletedAssistantAfterUser = turns.some(
      (t) => t.type === 'assistant' && t.status === 'completed' && t.sequence > lastUserTurn.sequence
    );
    if (hasCompletedAssistantAfterUser) {
      return turns;
    }

    const loaderTurn: Turn = {
      id: `thinking-loader-${lastUserTurn.id}`,
      type: 'assistant',
      sequence: lastUserTurn.sequence + 0.1,
      startedAt: new Date().toISOString(),
      completedAt: null,
      status: 'streaming',
      steps: [],
      metadata: { agentId: 'assistant-loader' },
    };

    return [...turns, loaderTurn].sort(compareTurns);
  })();

  const isLoading = isSwitchingSession || (sessionTurnsQuery.isFetching && turns.length === 0 && !!currentSessionId);

  return (
    <div style={{ padding: 16, height: '100%' }}>
      <UICard
        title={
          <UISpace>
            <UIIcon name="RobotOutlined" />
            <span>Agent</span>
          </UISpace>
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
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflow: 'auto',
          }}
        >
          <ConversationView
            turns={turnsWithThinkingLoader}
            isLoading={isLoading}
            scrollContainerRef={scrollContainerRef}
            sessionId={currentSessionId}
            source={sources.agent}
          />
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: '12px 16px',
            background: token.colorBgContainer,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div className={`agent-input-box agent-input-box--${agentMode}`} style={{ width: '65%', maxWidth: 780 }}>
            <UIInputTextArea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              autoSize={{ minRows: 2, maxRows: 8 }}
              disabled={isRunning}
              variant="borderless"
              style={{ resize: 'none', padding: '10px 12px 4px' }}
            />
            <div className="agent-input-toolbar">
              <UISpace size={6}>
                <UISelect
                  value={agentMode}
                  onChange={(v) => setAgentMode(v as 'execute' | 'plan')}
                  disabled={isRunning}
                  size="small"
                  variant="borderless"
                  style={{ width: 110 }}
                  options={[
                    { value: 'execute', label: 'Execute' },
                    { value: 'plan', label: 'Plan' },
                  ]}
                />
                <UISelect
                  value={responseMode}
                  onChange={(v) => setResponseMode(v as AgentResponseMode)}
                  disabled={isRunning}
                  size="small"
                  variant="borderless"
                  style={{ width: 80 }}
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: 'brief', label: 'Brief' },
                    { value: 'deep', label: 'Deep' },
                  ]}
                />
                <UISelect
                  value={tier}
                  onChange={(v) => setTier(v as 'small' | 'medium' | 'large')}
                  disabled={isRunning}
                  size="small"
                  variant="borderless"
                  style={{ width: 100 }}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                />
                <UISpace size={4} align="center">
                  <UISwitch
                    checked={enableEscalation}
                    onChange={setEnableEscalation}
                    disabled={isRunning || tier === 'large'}
                    size="small"
                  />
                  <UITypographyText type="secondary" style={{ fontSize: 12 }}>
                    Auto escalate
                  </UITypographyText>
                </UISpace>
              </UISpace>
              <div>
                {isRunning ? (
                  <UIButton
                    danger
                    size="small"
                    icon={stopMutation.isPending ? <UIIcon name="LoadingOutlined" /> : <UIIcon name="StopOutlined" />}
                    onClick={handleStop}
                    disabled={stopMutation.isPending}
                  >
                    Stop
                  </UIButton>
                ) : (
                  <UIButton
                    variant="primary"
                    size="small"
                    icon={startRunMutation.isPending ? <UIIcon name="LoadingOutlined" /> : <UIIcon name="SendOutlined" />}
                    onClick={handleStart}
                    disabled={!task.trim() || startRunMutation.isPending}
                  >
                    Send
                  </UIButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </UICard>
    </div>
  );
}
