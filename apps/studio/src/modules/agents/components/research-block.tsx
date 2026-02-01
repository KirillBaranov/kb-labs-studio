/**
 * @module ResearchBlock
 * Collapsible container showing agent research steps
 */

import React, { useState } from 'react';
import { Typography, theme } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { StepItem, type ResearchStep } from './step-item';

const { Text } = Typography;

interface ResearchBlockProps {
  steps: ResearchStep[];
  isRunning: boolean;
}

export function ResearchBlock({ steps, isRunning }: ResearchBlockProps) {
  const { token } = theme.useToken();
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate summary stats
  const completedCount = steps.filter(s => s.status === 'done').length;
  const errorCount = steps.filter(s => s.status === 'error').length;
  const totalCount = steps.length;
  const totalDuration = steps.reduce((sum, s) => sum + (s.duration || 0), 0);

  // Determine header status
  const getStatusText = () => {
    if (isRunning) {
      const runningStep = steps.find(s => s.status === 'running');
      return runningStep ? `Running: ${runningStep.task.slice(0, 30)}...` : 'Starting...';
    }
    if (errorCount > 0) {
      return `${completedCount}/${totalCount} completed, ${errorCount} failed`;
    }
    return `${completedCount} steps · ${(totalDuration / 1000).toFixed(1)}s`;
  };

  if (steps.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          background: token.colorBgLayout,
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isExpanded ? (
            <DownOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
          ) : (
            <RightOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
          )}
          <Text strong style={{ fontSize: 13 }}>Research</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {getStatusText()}
        </Text>
      </div>

      {/* Steps */}
      {isExpanded && (
        <div style={{ padding: '8px 12px' }}>
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
