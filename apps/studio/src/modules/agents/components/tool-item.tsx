/**
 * @module ToolItem
 * Single tool call with icon, preview, and expandable output
 */

import React, { useState } from 'react';
import { Typography, theme, Tooltip } from 'antd';
import {
  LoadingOutlined,
  CheckOutlined,
  WarningOutlined,
} from '@ant-design/icons';

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

/**
 * Get icon for tool type
 */
function getToolIcon(toolName: string): string {
  const baseName = toolName.split(':').pop() || toolName;
  switch (baseName) {
    case 'read':
      return '📄';
    case 'write':
      return '✏️';
    case 'edit':
      return '✏️';
    case 'glob':
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

/**
 * Format tool name for display
 */
function formatToolName(toolName: string, input?: Record<string, unknown>): string {
  const baseName = toolName.split(':').pop() || toolName;

  // Try to extract meaningful info from input
  const path = input?.path as string | undefined;
  const query = (input?.query || input?.text) as string | undefined;
  const pattern = input?.pattern as string | undefined;

  switch (baseName) {
    case 'read':
      return path ? path.split('/').pop() || 'file' : 'read';
    case 'write':
      return path ? path.split('/').pop() || 'file' : 'write';
    case 'edit':
      return path ? path.split('/').pop() || 'file' : 'edit';
    case 'glob':
      return pattern ? `glob "${pattern.slice(0, 20)}${pattern.length > 20 ? '…' : ''}"` : 'glob';
    case 'grep':
      return query ? `grep "${query.slice(0, 20)}${query.length > 20 ? '…' : ''}"` : 'grep';
    case 'rag-query':
      return query ? `"${query.slice(0, 25)}${query.length > 25 ? '…' : ''}"` : 'search';
    case 'bash':
      const cmd = input?.command as string | undefined;
      return cmd ? cmd.slice(0, 30) + (cmd.length > 30 ? '…' : '') : 'command';
    default:
      return baseName;
  }
}

/**
 * Generate short status text (shown on the right)
 */
function generateStatusText(tool: ToolCall): string {
  if (tool.status === 'running') return '';
  if (tool.status === 'error') return 'error';

  const output = tool.output || '';
  const baseName = tool.name.split(':').pop() || tool.name;
  const input = tool.input || {};

  switch (baseName) {
    case 'read':
    case 'fs_read': {
      const lines = output.split('\n').length;
      return `${lines} lines`;
    }
    case 'write':
    case 'fs_write': {
      const content = (input.content as string) || '';
      return `${content.split('\n').length} lines`;
    }
    case 'edit':
    case 'fs_edit': {
      const oldStr = (input.old_string as string) || '';
      const newStr = (input.new_string as string) || '';
      if (oldStr && newStr) {
        return `-${oldStr.split('\n').length} +${newStr.split('\n').length}`;
      }
      return 'edited';
    }
    case 'glob':
    case 'glob_search': {
      const files = output.split('\n').filter(Boolean);
      return `${files.length} files`;
    }
    case 'grep': {
      const matches = output.split('\n').filter(Boolean);
      return `${matches.length} matches`;
    }
    default:
      return 'done';
  }
}

/**
 * Generate compact preview content (shown below tool name)
 * Returns null if no preview should be shown
 */
function generateCompactPreview(tool: ToolCall): string[] | null {
  if (tool.status !== 'done') return null;

  const output = tool.output || '';
  const baseName = tool.name.split(':').pop() || tool.name;
  const input = tool.input || {};

  switch (baseName) {
    case 'glob':
    case 'glob_search': {
      // Show file list (max 5)
      const files = output.split('\n').filter(Boolean);
      if (files.length === 0) return null;
      return files.slice(0, 5).map(f => f.split('/').pop() || f);
    }

    case 'read':
    case 'fs_read':
      // No preview for read - just showing line count is enough
      return null;

    case 'edit':
    case 'fs_edit': {
      // Show what changed
      const oldStr = (input.old_string as string) || '';
      const newStr = (input.new_string as string) || '';
      if (!oldStr || !newStr) return null;
      const result: string[] = [];
      // Show first line of old (removed)
      const oldFirst = oldStr.split('\n')[0];
      if (oldFirst) result.push(`- ${oldFirst.slice(0, 50)}${oldFirst.length > 50 ? '…' : ''}`);
      // Show first line of new (added)
      const newFirst = newStr.split('\n')[0];
      if (newFirst) result.push(`+ ${newFirst.slice(0, 50)}${newFirst.length > 50 ? '…' : ''}`);
      return result.length > 0 ? result : null;
    }

    case 'grep': {
      // Show first 3 matches
      const matches = output.split('\n').filter(Boolean).slice(0, 3);
      if (matches.length === 0) return null;
      return matches.map(m => {
        // Format: file:line:content -> show just file:line
        const parts = m.split(':');
        if (parts.length >= 2) {
          const file = parts[0]?.split('/').pop() || parts[0];
          return `${file}:${parts[1]}`;
        }
        return m.slice(0, 50);
      });
    }

    case 'memory_get':
    case 'memory-get': {
      // Show first line of memory content
      const firstLine = output.split('\n').find(l => l.trim());
      if (!firstLine) return null;
      return [firstLine.slice(0, 60) + (firstLine.length > 60 ? '…' : '')];
    }

    default:
      return null;
  }
}

export function ToolItem({ tool, isLast }: ToolItemProps) {
  const { token } = theme.useToken();
  const [isExpanded, setIsExpanded] = useState(false);

  const icon = getToolIcon(tool.name);
  const displayName = formatToolName(tool.name, tool.input);
  const statusText = generateStatusText(tool);
  const compactPreview = generateCompactPreview(tool);
  const hasOutput = tool.output && tool.output.length > 0;

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: isLast ? 0 : 2,
        paddingLeft: 16,
      }}
    >
      {/* Vertical line */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: 3,
            top: 14,
            bottom: -2,
            width: 1,
            background: token.colorBorderSecondary,
          }}
        />
      )}

      {/* Horizontal connector + dot */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 8,
          width: 10,
          height: 1,
          background: token.colorBorderSecondary,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -2,
          top: 5,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: tool.status === 'error' ? token.colorError : token.colorBorderSecondary,
        }}
      />

      {/* Tool row */}
      <div
        onClick={() => hasOutput && setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '2px 0',
          cursor: hasOutput ? 'pointer' : 'default',
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: 12 }}>{icon}</span>

        {/* Name */}
        <Text
          style={{
            fontSize: 12,
            color: tool.status === 'error' ? token.colorError : token.colorTextSecondary,
            flex: 1,
          }}
          ellipsis
        >
          {displayName}
        </Text>

        {/* Status */}
        {tool.status === 'running' ? (
          <LoadingOutlined style={{ fontSize: 11, color: token.colorPrimary }} spin />
        ) : tool.status === 'error' ? (
          <Tooltip title={tool.error}>
            <Text type="danger" style={{ fontSize: 11 }}>
              <WarningOutlined /> error
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}>
            → {statusText}
          </Text>
        )}
      </div>

      {/* Compact preview (shown by default for completed tools) */}
      {compactPreview && compactPreview.length > 0 && !isExpanded && (
        <div
          style={{
            marginLeft: 18,
            marginTop: 2,
            marginBottom: 4,
            padding: '4px 8px',
            background: token.colorFillQuaternary,
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'monospace',
            color: token.colorTextTertiary,
            lineHeight: 1.4,
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          {compactPreview.map((line, i) => (
            <div
              key={i}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                color: line.startsWith('-') ? token.colorError : line.startsWith('+') ? token.colorSuccess : undefined,
              }}
            >
              {line}
            </div>
          ))}
          {compactPreview.length >= 5 && (
            <div style={{ color: token.colorTextQuaternary }}>…</div>
          )}
        </div>
      )}

      {/* Expanded output (full) */}
      {isExpanded && hasOutput && (
        <div
          style={{
            marginTop: 4,
            marginBottom: 8,
            padding: '8px 10px',
            background: token.colorBgLayout,
            borderRadius: 4,
            maxHeight: 200,
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
            {tool.output?.slice(0, 2000)}
            {(tool.output?.length || 0) > 2000 && '\n... (truncated)'}
          </pre>
        </div>
      )}
    </div>
  );
}
