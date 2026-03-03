/**
 * @module @kb-labs/studio-app/modules/agents/components/agent-selector
 * Agent selection dropdown
 */

import React from 'react';
import {
  UISelect,
  UISpace,
  UITypographyText,
  UITag,
  UISpin,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import type { AgentSpecification } from '@kb-labs/agent-contracts';

interface AgentSelectorProps {
  agents: AgentSpecification[];
  selectedAgentId: string | null;
  onSelect: (agentId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AgentSelector({
  agents,
  selectedAgentId,
  onSelect,
  loading = false,
  disabled = false,
}: AgentSelectorProps) {
  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  return (
    <UISpace direction="vertical" size="small" style={{ width: '100%' }}>
      <UISpace style={{ width: '100%' }}>
        <UIIcon name="RobotOutlined" />
        <UITypographyText strong>Agent:</UITypographyText>
        <UISelect
          value={selectedAgentId ?? undefined}
          onChange={(v) => onSelect(v as string)}
          loading={loading}
          disabled={disabled}
          style={{ minWidth: 200 }}
          placeholder="Select an agent"
          notFoundContent={loading ? <UISpin size="small" /> : 'No agents available'}
          options={agents.map((agent) => ({
            value: agent.id,
            label: agent.name,
          }))}
        />
      </UISpace>

      {selectedAgent && (
        <UITypographyText type="secondary" style={{ fontSize: 12, paddingLeft: 22 }}>
          {selectedAgent.description}
        </UITypographyText>
      )}

      {selectedAgent && selectedAgent.tools.length > 0 && (
        <div style={{ paddingLeft: 22 }}>
          <UISpace size={[4, 4]} wrap>
            {selectedAgent.tools.slice(0, 5).map((tool) => (
              <UITag key={tool} style={{ fontSize: 11 }}>
                {tool}
              </UITag>
            ))}
            {selectedAgent.tools.length > 5 && (
              <UITag style={{ fontSize: 11 }}>+{selectedAgent.tools.length - 5} more</UITag>
            )}
          </UISpace>
        </div>
      )}
    </UISpace>
  );
}
