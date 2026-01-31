/**
 * @module @kb-labs/studio-app/modules/agents/components/agent-selector
 * Agent selection dropdown
 */

import React from 'react';
import { Select, Space, Typography, Tag, Spin } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import type { AgentSpecification } from '@kb-labs/agent-contracts';

const { Text } = Typography;

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
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space style={{ width: '100%' }}>
        <RobotOutlined />
        <Text strong>Agent:</Text>
        <Select
          value={selectedAgentId}
          onChange={onSelect}
          loading={loading}
          disabled={disabled}
          style={{ minWidth: 200 }}
          placeholder="Select an agent"
          notFoundContent={loading ? <Spin size="small" /> : 'No agents available'}
        >
          {agents.map((agent) => (
            <Select.Option key={agent.id} value={agent.id}>
              <Space>
                {agent.name}
                {agent.tier && (
                  <Tag color="blue" style={{ marginLeft: 8 }}>
                    {agent.tier}
                  </Tag>
                )}
              </Space>
            </Select.Option>
          ))}
        </Select>
      </Space>

      {selectedAgent && (
        <Text type="secondary" style={{ fontSize: 12, paddingLeft: 22 }}>
          {selectedAgent.description}
        </Text>
      )}

      {selectedAgent && selectedAgent.tools.length > 0 && (
        <div style={{ paddingLeft: 22 }}>
          <Space size={[4, 4]} wrap>
            {selectedAgent.tools.slice(0, 5).map((tool) => (
              <Tag key={tool} style={{ fontSize: 11 }}>
                {tool}
              </Tag>
            ))}
            {selectedAgent.tools.length > 5 && (
              <Tag style={{ fontSize: 11 }}>+{selectedAgent.tools.length - 5} more</Tag>
            )}
          </Space>
        </div>
      )}
    </Space>
  );
}
