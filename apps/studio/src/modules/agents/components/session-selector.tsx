/**
 * @module @kb-labs/studio-app/modules/agents/components/session-selector
 * Session selector component for Agent chat
 */

import React from 'react';
import { Select, Button, Space, Typography, Spin, Tooltip } from 'antd';
import { PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useAgentSessions } from '@kb-labs/studio-data-client';
import type { AgentSessionInfo } from '@kb-labs/agent-contracts';

const { Text } = Typography;

interface SessionSelectorProps {
  agentId: string;
  currentSessionId: string | null;
  onSessionChange: (sessionId: string, session: AgentSessionInfo) => void;
  onNewChat: () => void;
}

/**
 * Format relative time for session display
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {return 'just now';}
  if (diffMins < 60) {return `${diffMins}m ago`;}
  if (diffHours < 24) {return `${diffHours}h ago`;}
  if (diffDays < 7) {return `${diffDays}d ago`;}
  return date.toLocaleDateString();
}

export function SessionSelector({
  currentSessionId,
  onSessionChange,
  onNewChat,
}: SessionSelectorProps) {
  const sources = useDataSources();

  // Fetch sessions (all sessions, not filtered by agent)
  const sessionsQuery = useAgentSessions(sources.agent, { limit: 20 });

  const handleSessionSelect = (sessionId: string) => {
    const session = sessionsQuery.data?.sessions.find((s) => s.id === sessionId);
    if (session) {
      onSessionChange(sessionId, session);
    }
  };

  const sessions = sessionsQuery.data?.sessions ?? [];

  return (
    <Space size="small" style={{ width: '100%' }}>
      <HistoryOutlined style={{ opacity: 0.5 }} />

      <Select
        style={{ flex: 1, minWidth: 200 }}
        placeholder="New chat"
        value={currentSessionId ?? undefined}
        onChange={handleSessionSelect}
        loading={sessionsQuery.isLoading}
        allowClear
        onClear={onNewChat}
        notFoundContent={
          sessionsQuery.isLoading ? (
            <Spin size="small" />
          ) : (
            <Text type="secondary">No sessions yet</Text>
          )
        }
        optionLabelProp="label"
        options={sessions.map((session) => ({
          value: session.id,
          label: session.name || session.task || 'Untitled',
          lastActivityAt: session.lastActivityAt,
        }))}
        optionRender={(option) => (
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text ellipsis style={{ maxWidth: 180 }}>
              {option.label}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {formatRelativeTime(option.data.lastActivityAt)}
            </Text>
          </Space>
        )}
      />

      <Tooltip title="New Chat">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNewChat}
        />
      </Tooltip>
    </Space>
  );
}
