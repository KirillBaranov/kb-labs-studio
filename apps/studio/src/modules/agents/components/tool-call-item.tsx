/**
 * @module @kb-labs/studio-app/modules/agents/components/tool-call-item
 * Minimal tool call display
 */

import { useState } from 'react';
import { Typography, theme } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { useToken } = theme;

interface ToolCallItemProps {
  toolName: string;
  input?: Record<string, unknown>;
  output?: string;
}

/**
 * Format tool name and extract key info
 */
function formatToolDisplay(toolName: string, input?: Record<string, unknown>): { name: string; detail?: string } {
  // Remove prefix like fs:, mind:, etc
  const parts = toolName.split(':');
  const rawName = parts[parts.length - 1] || toolName;

  // Convert to Title Case
  const name = rawName
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Extract meaningful detail based on tool type
  let detail: string | undefined;

  if (input) {
    // File operations - show file path
    if (input.filePath || input.path || input.file) {
      const path = String(input.filePath || input.path || input.file);
      // Show just filename or last part of path
      detail = path.split('/').pop() || path;
    }
    // Search operations - show query
    else if (input.query || input.text || input.pattern) {
      const q = String(input.query || input.text || input.pattern);
      detail = q.length > 50 ? q.slice(0, 50) + '...' : q;
    }
    // Command - show command
    else if (input.command) {
      const cmd = String(input.command);
      detail = cmd.length > 50 ? cmd.slice(0, 50) + '...' : cmd;
    }
  }

  return { name, detail };
}

export function ToolCallItem({ toolName, input, output }: ToolCallItemProps) {
  const { token } = useToken();
  const [expanded, setExpanded] = useState(false);

  const hasOutput = output && output.length > 0 && output !== 'Completed';
  const { name, detail } = formatToolDisplay(toolName, input);

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Header - single line */}
      <div
        onClick={() => hasOutput && setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: hasOutput ? 'pointer' : 'default',
          userSelect: 'none',
        }}
      >
        {/* Expand/collapse arrow */}
        <span style={{ fontSize: 10, width: 10, color: token.colorTextSecondary }}>
          {hasOutput && (expanded ? <DownOutlined /> : <RightOutlined />)}
        </span>

        {/* Tool name - bold */}
        <Text strong style={{ fontSize: 13 }}>
          {name}
        </Text>

        {/* Detail (file name, query, etc) */}
        {detail && (
          <Text type="secondary" style={{ fontSize: 13 }}>
            {detail}
          </Text>
        )}
      </div>

      {/* Expandable output */}
      {expanded && hasOutput && (
        <div
          style={{
            marginLeft: 16,
            marginTop: 4,
            padding: '8px 12px',
            background: token.colorBgLayout,
            borderRadius: 6,
            maxHeight: 300,
            overflow: 'auto',
          }}
        >
          <pre
            style={{
              margin: 0,
              fontSize: 12,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: token.colorText,
            }}
          >
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
