/**
 * @module @kb-labs/studio-app/modules/agents/components/run-panel
 * Panel for starting/stopping agent runs
 */

import React, { useState } from 'react';
import { Input, Button, Space, Tag, Typography } from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { ConnectionStatus } from '@kb-labs/studio-data-client';

const { Text } = Typography;

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
      return { icon: <CheckCircleOutlined />, text: 'Connected', color: 'green' };
    case 'connecting':
      return { icon: <LoadingOutlined spin />, text: 'Connecting...', color: 'blue' };
    case 'reconnecting':
      return { icon: <SyncOutlined spin />, text: 'Reconnecting...', color: 'orange' };
    case 'error':
      return { icon: <CloseCircleOutlined />, text: 'Connection Error', color: 'red' };
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
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Input.TextArea
        value={task}
        onChange={(e) => setTask(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the task for the agent..."
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={disabled || isRunning}
        style={{ fontSize: 14 }}
      />

      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          {!isRunning ? (
            <Button
              type="primary"
              icon={isStarting ? <LoadingOutlined /> : <PlayCircleOutlined />}
              onClick={handleStart}
              disabled={!task.trim() || disabled || isStarting}
              loading={isStarting}
            >
              {isStarting ? 'Starting...' : 'Start'}
            </Button>
          ) : (
            <Button
              danger
              icon={isStopping ? <LoadingOutlined /> : <StopOutlined />}
              onClick={onStop}
              disabled={isStopping}
              loading={isStopping}
            >
              {isStopping ? 'Stopping...' : 'Stop'}
            </Button>
          )}

          {isRunning && (
            <Tag icon={statusDisplay.icon} color={statusDisplay.color}>
              {statusDisplay.text}
            </Tag>
          )}
        </Space>

        {isRunning && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            Press Escape or click Stop to cancel
          </Text>
        )}
      </Space>
    </Space>
  );
}
