/**
 * @module ToolItem
 * Tool display with simple clean design
 */

import React, { useState } from 'react';
import { Typography, theme } from 'antd';

const { Text } = Typography;

export interface ToolCall {
  id: string;
  name: string;
  status: 'running' | 'done' | 'error';
  preview: string;
  output?: string;
  input?: Record<string, unknown>;
  error?: string;
}

interface ToolItemProps {
  tool: ToolCall;
  isLast: boolean;
}

function getToolIcon(toolName: string): string {
  const baseName = toolName.split(':').pop() || toolName;
  switch (baseName) {
    case 'read':
      return '📄';
    case 'write':
    case 'edit':
      return '✏️';
    case 'glob':
    case 'list':
      return '📁';
    case 'grep':
      return '🔎';
    case 'rag-query':
      return '🔍';
    case 'bash':
      return '⚡';
    default:
      return '🔧';
  }
}

function formatToolName(toolName: string, input?: Record<string, unknown>): string {
  const baseName = toolName.split(':').pop() || toolName;
  const path = (input?.path || input?.file_path || input?.filePath) as string | undefined;
  const query = (input?.query || input?.text) as string | undefined;
  const pattern = input?.pattern as string | undefined;

  switch (baseName) {
    case 'read':
    case 'write':
    case 'edit':
      return path ? `${baseName} ${path.split('/').pop()}` : baseName;
    case 'glob':
      return pattern ? `glob "${pattern.slice(0, 30)}..."` : 'glob';
    case 'grep':
      return query ? `grep "${query.slice(0, 30)}..."` : 'grep';
    case 'rag-query':
      return query ? `"${query.slice(0, 40)}..."` : 'search';
    case 'bash':
      const cmd = input?.command as string | undefined;
      return cmd ? `$ ${cmd.slice(0, 40)}...` : 'bash';
    case 'list':
      return 'list files';
    default:
      return baseName;
  }
}

export function ToolItem({ tool, isLast }: ToolItemProps) {
  const { token } = theme.useToken();
  const [isExpanded, setIsExpanded] = useState(false);

  const icon = getToolIcon(tool.name);
  const displayName = formatToolName(tool.name, tool.input);
  const hasOutput = tool.output && tool.output.length > 100;

  const statusText = tool.status === 'running'
    ? 'running...'
    : tool.status === 'error'
    ? 'error'
    : tool.preview || 'done';
  const statusColor = tool.status === 'running'
    ? token.colorPrimary
    : tool.status === 'error'
    ? token.colorError
    : token.colorSuccess;

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: isLast ? 0 : 6,
      }}
    >
      {/* Vertical line (if not last) */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: 6,
            top: 18,
            bottom: -6,
            width: 2,
            background: token.colorBorderSecondary,
            borderRadius: 1,
          }}
        />
      )}

      {/* Tool header */}
      <div
        onClick={() => hasOutput && setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: hasOutput ? 'pointer' : 'default',
          paddingTop: 4,
          paddingBottom: 4,
        }}
      >
        {/* Status point */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: statusColor,
            flexShrink: 0,
            zIndex: 1,
            position: 'relative',
          }}
        />

        <Text style={{ fontSize: 14 }}>
          {icon}
        </Text>
        <Text
          style={{
            flex: 1,
            fontSize: 12,
            color: tool.status === 'error' ? token.colorError : token.colorTextSecondary,
          }}
        >
          {displayName}
        </Text>
        <Text style={{ color: statusColor, fontSize: 11 }}>
          {statusText}
        </Text>
      </div>

      {/* Error */}
      {tool.error && (
        <div
          style={{
            marginTop: 4,
            marginLeft: 32,
            padding: '4px 8px',
            background: token.colorErrorBg,
            border: `1px solid ${token.colorErrorBorder}`,
            borderRadius: 4,
          }}
        >
          <Text style={{ color: token.colorError, fontSize: 11 }}>
            ⚠️ {tool.error}
          </Text>
        </div>
      )}

      {/* Expanded output */}
      {isExpanded && hasOutput && (
        <div
          style={{
            marginTop: 4,
            marginLeft: 32,
            padding: '8px 10px',
            background: token.colorBgLayout,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 4,
            maxHeight: 150,
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: 11,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: token.colorTextSecondary,
            }}
          >
            {tool.output?.slice(0, 1000)}
            {(tool.output?.length || 0) > 1000 && '\n... (truncated)'}
          </pre>
        </div>
      )}
    </div>
  );
}
