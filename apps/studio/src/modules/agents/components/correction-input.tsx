/**
 * @module @kb-labs/studio-app/modules/agents/components/correction-input
 * Input for sending corrections to running agents
 */

import React, { useState } from 'react';
import { Input, Button, Space, Select, Typography, message } from 'antd';
import { SendOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface CorrectionInputProps {
  onSend: (correction: string, targetAgentId?: string) => void;
  activeAgents?: Array<{ id: string; task: string; status: string }>;
  isPending?: boolean;
  disabled?: boolean;
}

export function CorrectionInput({
  onSend,
  activeAgents = [],
  isPending = false,
  disabled = false,
}: CorrectionInputProps) {
  const [correction, setCorrection] = useState('');
  const [targetAgent, setTargetAgent] = useState<string | undefined>(undefined);

  const handleSend = () => {
    if (!correction.trim()) {
      message.warning('Please enter a correction message');
      return;
    }

    onSend(correction.trim(), targetAgent);
    setCorrection('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isPending && !disabled) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Space style={{ width: '100%' }}>
        <Text strong style={{ fontSize: 12 }}>Correction:</Text>
        {activeAgents.length > 0 && (
          <Select
            value={targetAgent}
            onChange={setTargetAgent}
            allowClear
            placeholder="All agents"
            style={{ minWidth: 150 }}
            size="small"
            disabled={disabled || isPending}
          >
            {activeAgents.map((agent) => (
              <Select.Option key={agent.id} value={agent.id}>
                {agent.id}
              </Select.Option>
            ))}
          </Select>
        )}
      </Space>

      <Space.Compact style={{ width: '100%' }}>
        <Input
          value={correction}
          onChange={(e) => setCorrection(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a correction or feedback to the agent..."
          disabled={disabled || isPending}
        />
        <Button
          type="primary"
          icon={isPending ? <LoadingOutlined /> : <SendOutlined />}
          onClick={handleSend}
          disabled={!correction.trim() || disabled || isPending}
        >
          Send
        </Button>
      </Space.Compact>

      <Text type="secondary" style={{ fontSize: 11 }}>
        Tip: Corrections are routed by the orchestrator to the most relevant agent
      </Text>
    </Space>
  );
}
