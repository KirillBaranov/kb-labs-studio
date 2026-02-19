/**
 * @module StatusIndicator
 * Shows current agent status (analyzing, planning, researching, finalizing)
 */

import React from 'react';
import { Typography, theme } from 'antd';
import type { AgentEvent } from '@kb-labs/agent-contracts';

const { Text } = Typography;

interface StatusIndicatorProps {
  events: AgentEvent[];
}

/**
 * Get most recent status from events
 */
function getCurrentStatus(events: AgentEvent[]): { status: string; message: string } | null {
  // Find most recent status:change event
  const statusEvents = events
    .filter(e => e.type === 'status:change')
    .reverse();

  const lastStatus = statusEvents[0];
  if (!lastStatus) return null;

  const data = lastStatus.data as { status: string; message?: string };
  return {
    status: data.status,
    message: data.message || '',
  };
}

/**
 * Get icon and color for status
 */
function getStatusStyle(status: string, token: any): { emoji: string; color: string } {
  switch (status) {
    case 'analyzing':
      return { emoji: '🔍', color: token.colorInfo };
    case 'planning':
      return { emoji: '📋', color: token.colorPrimary };
    case 'researching':
      return { emoji: '🔬', color: token.colorPrimary };
    case 'executing':
      return { emoji: '⚡', color: token.colorPrimary };
    case 'finalizing':
      return { emoji: '✍️', color: token.colorSuccess };
    case 'thinking':
      return { emoji: '💭', color: token.colorPrimary };
    case 'waiting':
      return { emoji: '⏸️', color: token.colorWarning };
    case 'done':
      return { emoji: '✅', color: token.colorSuccess };
    case 'error':
      return { emoji: '❌', color: token.colorError };
    default:
      return { emoji: '●', color: token.colorPrimary };
  }
}

export function StatusIndicator({ events }: StatusIndicatorProps) {
  const { token } = theme.useToken();
  const currentStatus = getCurrentStatus(events);

  if (!currentStatus) return null;

  const { emoji, color } = getStatusStyle(currentStatus.status, token);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: token.colorBgLayout,
        borderRadius: 8,
        marginBottom: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text strong style={{ fontSize: 13, color }}>
        {currentStatus.status.charAt(0).toUpperCase() + currentStatus.status.slice(1)}
      </Text>
      {currentStatus.message && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {currentStatus.message}
        </Text>
      )}
    </div>
  );
}
