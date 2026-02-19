/**
 * @module StepItem
 * Tree node for research step with visual tree lines (CSS-based)
 */

import React, { useState } from 'react';
import { Typography, theme } from 'antd';
import { MarkdownViewer } from '@/components/markdown';
import { ToolItem, type ToolCall } from './tool-item';

const { Text } = Typography;

export interface ResearchStep {
  id: string;
  task: string;
  status: 'pending' | 'running' | 'done' | 'error';
  duration?: number;
  tools: ToolCall[];
  error?: string;
  thoughts?: string[];
}

interface StepItemProps {
  step: ResearchStep;
  isLast: boolean;
  level: number;
}

function formatDuration(ms?: number): string {
  if (!ms) return '';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function getStatusIcon(status: string, token: any): { emoji: string; color: string } {
  switch (status) {
    case 'done':
      return { emoji: '✓', color: token.colorSuccess };
    case 'error':
      return { emoji: '✗', color: token.colorError };
    case 'running':
      return { emoji: '⚡', color: token.colorPrimary };
    case 'pending':
      return { emoji: '○', color: token.colorTextDisabled };
    default:
      return { emoji: '○', color: token.colorTextSecondary };
  }
}

export function StepItem({ step, isLast, level }: StepItemProps) {
  const { token } = theme.useToken();
  const [isExpanded, setIsExpanded] = useState(true);

  const { emoji, color } = getStatusIcon(step.status, token);
  const hasTools = step.tools.length > 0;
  const hasThoughts = step.thoughts && step.thoughts.length > 0;
  const hasContent = hasTools || step.error || hasThoughts;

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: isLast ? 0 : 8,
      }}
    >
      {/* Vertical line (if not last) */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 24,
            bottom: -8,
            width: 2,
            background: token.colorBorderSecondary,
            borderRadius: 1,
          }}
        />
      )}

      {/* Step header */}
      <div
        onClick={() => hasContent && setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: hasContent ? 'pointer' : 'default',
          paddingTop: 4,
          paddingBottom: 4,
        }}
      >
        {/* Status circle with emoji */}
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: token.colorBgLayout,
            border: `2px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            flexShrink: 0,
            zIndex: 1,
            position: 'relative',
          }}
        >
          {emoji}
        </div>

        {/* Task name */}
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            color: step.status === 'pending' ? token.colorTextDisabled : token.colorText,
          }}
        >
          {step.task}
        </Text>

        {/* Duration/status */}
        <Text type="secondary" style={{ fontSize: 12 }}>
          {step.status === 'running' ? (
            <span style={{ color: token.colorPrimary }}>running...</span>
          ) : step.status === 'error' ? (
            <span style={{ color: token.colorError }}>error</span>
          ) : step.status === 'pending' ? (
            'pending'
          ) : (
            formatDuration(step.duration)
          )}
        </Text>
      </div>

      {/* Expanded content */}
      {isExpanded && hasContent && (
        <div style={{ marginLeft: 28, marginTop: 4 }}>
          {/* Error */}
          {step.error && (
            <div
              style={{
                padding: '6px 10px',
                marginBottom: 6,
                background: token.colorErrorBg,
                border: `1px solid ${token.colorErrorBorder}`,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: token.colorError, fontSize: 12 }}>
                ⚠️ {step.error}
              </Text>
            </div>
          )}

          {/* Tools */}
          {step.tools.map((tool, index) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              isLast={index === step.tools.length - 1}
            />
          ))}

          {/* Thoughts (agent answer - after tools) */}
          {hasThoughts && step.thoughts!.map((thought, idx) => (
            <div
              key={idx}
              style={{
                marginTop: 12,
                marginBottom: 12,
              }}
            >
              <MarkdownViewer className="chat-message-markdown">
                {thought}
              </MarkdownViewer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
