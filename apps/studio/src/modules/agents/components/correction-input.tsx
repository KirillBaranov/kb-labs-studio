/**
 * @module @kb-labs/studio-app/modules/agents/components/correction-input
 * Input for sending corrections to running agents
 */

import React, { useState } from 'react';
import {
  UIInput,
  UIButton,
  UISpace,
  UISelect,
  UITypographyText,
  UIMessage,
  UIIcon,
} from '@kb-labs/studio-ui-kit';

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
      UIMessage.warning('Please enter a correction message');
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
    <UISpace direction="vertical" size="small" style={{ width: '100%' }}>
      <UISpace style={{ width: '100%' }}>
        <UITypographyText strong style={{ fontSize: 12 }}>Correction:</UITypographyText>
        {activeAgents.length > 0 && (
          <UISelect
            value={targetAgent}
            onChange={(v) => setTargetAgent(v as string | undefined)}
            allowClear
            placeholder="All agents"
            style={{ minWidth: 150 }}
            size="small"
            disabled={disabled || isPending}
            options={activeAgents.map((agent) => ({ value: agent.id, label: agent.id }))}
          />
        )}
      </UISpace>

      <UISpace.Compact style={{ width: '100%' }}>
        <UIInput
          value={correction}
          onChange={(value) => setCorrection(value)}
          onKeyDown={handleKeyDown}
          placeholder="Send a correction or feedback to the agent..."
          disabled={disabled || isPending}
        />
        <UIButton
          variant="primary"
          icon={isPending ? <UIIcon name="LoadingOutlined" /> : <UIIcon name="SendOutlined" />}
          onClick={handleSend}
          disabled={!correction.trim() || disabled || isPending}
        >
          Send
        </UIButton>
      </UISpace.Compact>

      <UITypographyText type="secondary" style={{ fontSize: 11 }}>
        Tip: Corrections are routed by the orchestrator to the most relevant agent
      </UITypographyText>
    </UISpace>
  );
}
