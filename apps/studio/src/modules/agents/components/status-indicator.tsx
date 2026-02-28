/**
 * @module StatusIndicator
 * Shows current agent status (analyzing, planning, researching, finalizing)
 */

import React from 'react';
import { UITypographyText, useUITheme } from '@kb-labs/studio-ui-kit';
import type { AgentEvent } from '@kb-labs/agent-contracts';

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
  if (!lastStatus) {return null;}

  const data = lastStatus.data as { status: string; message?: string };
  return {
    status: data.status,
    message: data.message || '',
  };
}

/**
 * Get icon and color for status
 */
function getStatusStyle(status: string, token: any): { label: string; color: string } {
  switch (status) {
    case 'analyzing':
      return { label: 'Analyzing', color: token.colorInfo };
    case 'planning':
      return { label: 'Planning', color: token.colorPrimary };
    case 'researching':
      return { label: 'Researching', color: token.colorPrimary };
    case 'executing':
      return { label: 'Executing', color: token.colorPrimary };
    case 'finalizing':
      return { label: 'Finalizing', color: token.colorSuccess };
    case 'thinking':
      return { label: 'Thinking', color: token.colorPrimary };
    case 'waiting':
      return { label: 'Waiting', color: token.colorWarning };
    case 'done':
      return { label: 'Done', color: token.colorSuccess };
    case 'error':
      return { label: 'Error', color: token.colorError };
    default:
      return { label: status, color: token.colorPrimary };
  }
}

export function StatusIndicator({ events }: StatusIndicatorProps) {
  const { token } = useUITheme();
  const currentStatus = getCurrentStatus(events);

  if (!currentStatus) {return null;}

  const { label, color } = getStatusStyle(currentStatus.status, token);

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
      <UITypographyText strong style={{ fontSize: 13, color }}>
        {label}
      </UITypographyText>
      {currentStatus.message && (
        <UITypographyText type="secondary" style={{ fontSize: 12 }}>
          {currentStatus.message}
        </UITypographyText>
      )}
    </div>
  );
}
