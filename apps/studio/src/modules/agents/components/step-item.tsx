/**
 * @module StepItem
 * Single research step (agent) with expandable tool calls
 */

import React, { useState } from 'react';
import { Typography, theme, Tooltip } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  LoadingOutlined,
  ClockCircleOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { ToolItem, type ToolCall } from './tool-item';

const { Text } = Typography;

export interface ResearchStep {
  id: string;
  task: string;
  status: 'pending' | 'running' | 'done' | 'error';
  duration?: number;
  tools: ToolCall[];
  error?: string;
  /** Agent's reasoning/thoughts from llm:end events */
  thoughts?: string[];
}

interface StepItemProps {
  step: ResearchStep;
  isLast: boolean;
}

export function StepItem({ step, isLast }: StepItemProps) {
  const { token } = theme.useToken();
  const [isExpanded, setIsExpanded] = useState(step.status === 'running' || step.status === 'error');

  const hasTools = step.tools.length > 0;
  const hasThoughts = step.thoughts && step.thoughts.length > 0;
  const canExpand = hasTools || step.error || hasThoughts;

  // Status icon
  const StatusIcon = () => {
    switch (step.status) {
      case 'done':
        return <CheckCircleFilled style={{ color: token.colorSuccess, fontSize: 14 }} />;
      case 'error':
        return <CloseCircleFilled style={{ color: token.colorError, fontSize: 14 }} />;
      case 'running':
        return <LoadingOutlined style={{ color: token.colorPrimary, fontSize: 14 }} spin />;
      default:
        return <ClockCircleOutlined style={{ color: token.colorTextDisabled, fontSize: 14 }} />;
    }
  };

  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div
      style={{
        position: 'relative',
        paddingLeft: 20,
        paddingBottom: isLast ? 0 : 8,
      }}
    >
      {/* Vertical connector line */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 18,
            bottom: 0,
            width: 1,
            background: token.colorBorderSecondary,
          }}
        />
      )}

      {/* Step header */}
      <div
        onClick={() => canExpand && setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: canExpand ? 'pointer' : 'default',
          padding: '4px 0',
        }}
      >
        {/* Expand arrow */}
        <div style={{ width: 12, display: 'flex', justifyContent: 'center' }}>
          {canExpand ? (
            isExpanded ? (
              <DownOutlined style={{ fontSize: 9, color: token.colorTextSecondary }} />
            ) : (
              <RightOutlined style={{ fontSize: 9, color: token.colorTextSecondary }} />
            )
          ) : null}
        </div>

        {/* Status icon */}
        <StatusIcon />

        {/* Task name */}
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            color: step.status === 'pending' ? token.colorTextDisabled : token.colorText,
          }}
          ellipsis
        >
          {step.task}
        </Text>

        {/* Duration / Status */}
        <Text
          type="secondary"
          style={{ fontSize: 12, minWidth: 50, textAlign: 'right' }}
        >
          {step.status === 'running' ? (
            <span style={{ color: token.colorPrimary }}>running</span>
          ) : step.status === 'error' ? (
            <span style={{ color: token.colorError }}>error</span>
          ) : step.status === 'pending' ? (
            'pending'
          ) : (
            formatDuration(step.duration)
          )}
        </Text>
      </div>

      {/* Expanded content: thoughts, tools, or error */}
      {isExpanded && canExpand && (
        <div style={{ paddingLeft: 20, paddingTop: 4 }}>
          {/* Error message */}
          {step.error && (
            <div
              style={{
                padding: '6px 10px',
                background: token.colorErrorBg,
                borderRadius: 4,
                marginBottom: 8,
              }}
            >
              <Text type="danger" style={{ fontSize: 12 }}>
                ⚠️ {step.error}
              </Text>
            </div>
          )}

          {/* Agent thoughts/reasoning */}
          {hasThoughts && (
            <div
              style={{
                padding: '8px 12px',
                background: token.colorFillQuaternary,
                borderRadius: 6,
                marginBottom: 8,
                borderLeft: `3px solid ${token.colorPrimary}`,
              }}
            >
              {step.thoughts!.map((thought, idx) => (
                <Text
                  key={idx}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: token.colorTextSecondary,
                    lineHeight: 1.5,
                    marginBottom: idx < step.thoughts!.length - 1 ? 8 : 0,
                  }}
                >
                  💭 {thought.length > 300 ? thought.slice(0, 300) + '...' : thought}
                </Text>
              ))}
            </div>
          )}

          {/* Tool calls */}
          {step.tools.map((tool, index) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              isLast={index === step.tools.length - 1 && !hasThoughts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
