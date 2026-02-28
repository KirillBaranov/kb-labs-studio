/**
 * @module @kb-labs/studio-app/modules/agents/components/run-panel
 * Panel for starting/stopping agent runs
 */

import React, { useState } from 'react';
import {
  UIInput, UIInputTextArea,
  UIButton,
  UISpace,
  UITag,
  UITypographyText,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import type { ConnectionStatus } from '@kb-labs/studio-data-client';

interface RunPanelProps {
  onStart: (task: string) => void;
  onStop: () => void;
  isRunning: boolean;
  isStarting: boolean;
  isStopping: boolean;
  connectionStatus: ConnectionStatus;
  disabled?: boolean;
}

function getStatusDisplay(status: ConnectionStatus): { icon: React.ReactNode; text: string; color: string } {
  switch (status) {
    case 'connected':
      return { icon: <UIIcon name="CheckCircleOutlined" />, text: 'Connected', color: 'green' };
    case 'connecting':
      return { icon: <UIIcon name="LoadingOutlined" spin />, text: 'Connecting...', color: 'blue' };
    case 'reconnecting':
      return { icon: <UIIcon name="SyncOutlined" spin />, text: 'Reconnecting...', color: 'orange' };
    case 'error':
      return { icon: <UIIcon name="CloseCircleOutlined" />, text: 'Connection Error', color: 'red' };
    case 'disconnected':
    default:
      return { icon: null, text: 'Disconnected', color: 'default' };
  }
}

export function RunPanel({
  onStart,
  onStop,
  isRunning,
  isStarting,
  isStopping,
  connectionStatus,
  disabled = false,
}: RunPanelProps) {
  const [task, setTask] = useState('');

  const handleStart = () => {
    if (task.trim()) {
      onStart(task.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isRunning && !isStarting && !disabled) {
      e.preventDefault();
      handleStart();
    }
  };

  const statusDisplay = getStatusDisplay(connectionStatus);

  return (
    <UISpace direction="vertical" size="middle" style={{ width: '100%' }}>
      <UIInputTextArea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the task for the agent..."
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={disabled || isRunning}
        style={{ fontSize: 14 }}
      />

      <UISpace style={{ width: '100%', justifyContent: 'space-between' }}>
        <UISpace>
          {!isRunning ? (
            <UIButton
              type="primary"
              icon={isStarting ? <UIIcon name="LoadingOutlined" /> : <UIIcon name="PlayCircleOutlined" />}
              onClick={handleStart}
              disabled={!task.trim() || disabled || isStarting}
              loading={isStarting}
            >
              {isStarting ? 'Starting...' : 'Start'}
            </UIButton>
          ) : (
            <UIButton
              danger
              icon={isStopping ? <UIIcon name="LoadingOutlined" /> : <UIIcon name="StopOutlined" />}
              onClick={onStop}
              disabled={isStopping}
              loading={isStopping}
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </UIButton>
          )}

          {isRunning && (
            <UITag icon={statusDisplay.icon} color={statusDisplay.color}>
              {statusDisplay.text}
            </UITag>
          )}
        </UISpace>

        {isRunning && (
          <UITypographyText type="secondary" style={{ fontSize: 12 }}>
            Press Escape or click Stop to cancel
          </UITypographyText>
        )}
      </UISpace>
    </UISpace>
  );
}
