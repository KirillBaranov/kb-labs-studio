/**
 * @module @kb-labs/studio-app/modules/agents/components/run-stats
 * Statistics display for agent run
 */

import React, { useEffect, useState } from 'react';
import {
  UISpace,
  UITag,
  UITypographyText,
  UIStatistic,
  UIRow,
  UICol,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import type { AgentEvent } from '@kb-labs/agent-contracts';

interface RunStatsProps {
  events: AgentEvent[];
  status: 'idle' | 'running' | 'completed' | 'failed' | 'stopped';
  startTime?: number;
  endTime?: number;
}

function getStatusDisplay(status: RunStatsProps['status']): {
  icon: React.ReactNode;
  color: string;
  text: string;
} {
  switch (status) {
    case 'running':
      return { icon: <UIIcon name="LoadingOutlined" spin />, color: 'processing', text: 'Running' };
    case 'completed':
      return { icon: <UIIcon name="CheckCircleOutlined" />, color: 'success', text: 'Completed' };
    case 'failed':
      return { icon: <UIIcon name="CloseCircleOutlined" />, color: 'error', text: 'Failed' };
    case 'stopped':
      return { icon: <UIIcon name="PauseCircleOutlined" />, color: 'warning', text: 'Stopped' };
    case 'idle':
    default:
      return { icon: null, color: 'default', text: 'Idle' };
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) {return `${ms}ms`;}
  if (ms < 60000) {return `${(ms / 1000).toFixed(1)}s`;}
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

export function RunStats({ events, status, startTime, endTime }: RunStatsProps) {
  const [elapsed, setElapsed] = useState(0);

  // Live elapsed time
  useEffect(() => {
    if (status !== 'running' || !startTime) {return;}

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 100);

    return () => clearInterval(interval);
  }, [status, startTime]);

  // Calculate stats from events
  const toolCalls = events.filter((e) => e.type === 'tool:end').length;
  const successfulTools = events.filter(
    (e) => e.type === 'tool:end' && e.data.success
  ).length;
  const failedTools = toolCalls - successfulTools;

  // Get tokens from agent:end event
  const endEvent = events.find((e) => e.type === 'agent:end');
  const tokensUsed = endEvent?.data?.tokensUsed ?? 0;

  // Duration
  const duration = status === 'running'
    ? elapsed
    : (endTime && startTime ? endTime - startTime : 0);

  const statusDisplay = getStatusDisplay(status);

  if (status === 'idle' && events.length === 0) {
    return null;
  }

  return (
    <UISpace direction="vertical" size="small" style={{ width: '100%' }}>
      <UISpace style={{ width: '100%', justifyContent: 'space-between' }}>
        <UITag icon={statusDisplay.icon} color={statusDisplay.color}>
          {statusDisplay.text}
        </UITag>
        {duration > 0 && (
          <UITypographyText type="secondary">
            <UIIcon name="ClockCircleOutlined" style={{ marginRight: 4 }} />
            {formatDuration(duration)}
          </UITypographyText>
        )}
      </UISpace>

      <UIRow gutter={16}>
        <UICol span={8}>
          <UIStatistic
            title="Tool Calls"
            value={toolCalls}
            prefix={<UIIcon name="NodeIndexOutlined" />}
            valueStyle={{ fontSize: 20 }}
          />
          {failedTools > 0 && (
            <UITypographyText type="danger" style={{ fontSize: 12 }}>
              {failedTools} failed
            </UITypographyText>
          )}
        </UICol>
        <UICol span={8}>
          <UIStatistic
            title="Events"
            value={events.length}
            prefix={<UIIcon name="ThunderboltOutlined" />}
            valueStyle={{ fontSize: 20 }}
          />
        </UICol>
        <UICol span={8}>
          <UIStatistic
            title="Tokens"
            value={tokensUsed}
            valueStyle={{ fontSize: 20 }}
            formatter={(value) => value ? Number(value).toLocaleString() : '-'}
          />
        </UICol>
      </UIRow>
    </UISpace>
  );
}
