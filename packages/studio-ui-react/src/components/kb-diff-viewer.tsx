/**
 * @module @kb-labs/studio-ui-react/components/kb-diff-viewer
 * Universal diff viewer component for displaying git diffs
 *
 * Accepts raw diff string and renders with syntax highlighting.
 */

import * as React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

export interface KBDiffViewerProps {
  /** Raw diff string (git diff output) */
  diff: string;
  /** Show line numbers (default: true) */
  showLineNumbers?: boolean;
  /** Max height in pixels (default: 400) */
  maxHeight?: number;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * Parse a raw git diff line and determine its type
 */
function parseDiffLine(line: string): { type: 'add' | 'remove' | 'context' | 'header'; content: string } {
  if (line.startsWith('@@')) {
    return { type: 'header', content: line };
  }
  if (line.startsWith('+')) {
    return { type: 'add', content: line };
  }
  if (line.startsWith('-')) {
    return { type: 'remove', content: line };
  }
  return { type: 'context', content: line };
}

/**
 * Get background color for diff line
 */
function getLineBackground(type: string): string {
  switch (type) {
    case 'add':
      return 'rgba(40, 167, 69, 0.15)'; // Green with transparency
    case 'remove':
      return 'rgba(220, 53, 69, 0.15)'; // Red with transparency
    case 'header':
      return 'rgba(108, 117, 125, 0.1)'; // Gray with transparency
    default:
      return 'transparent';
  }
}

/**
 * Get text color for diff line
 */
function getLineColor(type: string): string {
  switch (type) {
    case 'add':
      return '#28a745'; // Green
    case 'remove':
      return '#dc3545'; // Red
    case 'header':
      return '#6c757d'; // Gray
    default:
      return 'inherit';
  }
}

/**
 * Universal DiffViewer component
 *
 * @example
 * ```tsx
 * <KBDiffViewer
 *   diff={diffString}
 *   showLineNumbers={true}
 *   maxHeight={600}
 * />
 * ```
 */
export function KBDiffViewer({
  diff,
  showLineNumbers = true,
  maxHeight = 400,
  style
}: KBDiffViewerProps) {
  if (!diff || diff.trim() === '') {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <Text type="secondary">No changes to display</Text>
      </div>
    );
  }

  const lines = diff.split('\n');

  return (
    <div
      style={{
        background: 'rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 6,
        padding: 0,
        fontFamily: 'Monaco, Menlo, "Courier New", monospace',
        fontSize: 13,
        lineHeight: '1.5',
        maxHeight,
        overflow: 'auto',
        ...style,
      }}
    >
      {lines.map((line, index) => {
        const parsed = parseDiffLine(line);

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              background: getLineBackground(parsed.type),
              borderLeft: parsed.type !== 'context' ? `3px solid ${getLineColor(parsed.type)}` : 'none',
              paddingLeft: parsed.type !== 'context' ? 8 : 11,
            }}
          >
            {showLineNumbers && (
              <Text
                type="secondary"
                style={{
                  minWidth: 50,
                  textAlign: 'right',
                  paddingRight: 12,
                  userSelect: 'none',
                  color: '#6c757d',
                  fontSize: 12,
                }}
              >
                {index + 1}
              </Text>
            )}
            <pre
              style={{
                margin: 0,
                padding: 0,
                color: getLineColor(parsed.type),
                whiteSpace: 'pre',
                wordWrap: 'normal',
                flex: 1,
              }}
            >
              {parsed.content}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
