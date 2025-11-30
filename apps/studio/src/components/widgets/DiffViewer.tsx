/**
 * @module @kb-labs/studio-app/components/widgets/DiffViewer
 * Diff Viewer widget - unified/side-by-side diff
 */

import * as React from 'react';
import { Collapse, Typography, Tag, Space } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import type { BaseWidgetProps } from './types';

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header?: string;
  lines: string[];
}

export interface DiffPayload {
  mode?: 'unified' | 'split';
  hunks: DiffHunk[];
}

export interface DiffViewerOptions {
  mode?: 'unified' | 'split';
  collapsed?: boolean;
}

export interface DiffViewerProps extends BaseWidgetProps<DiffPayload, DiffViewerOptions> {}

export function DiffViewer({ data, loading, error, options }: DiffViewerProps) {
  const [collapsedHunks, setCollapsedHunks] = React.useState<Set<number>>(new Set());

  if (loading) {
    return <Skeleton variant="text" rows={10} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || !data.hunks || data.hunks.length === 0) {
    return <EmptyState title="No diff" description="No diff data available" />;
  }

  const mode = options?.mode || data.mode || 'unified';
  const collapsed = options?.collapsed === true;

  const items = data.hunks.map((hunk: any, index: number) => {
    const isCollapsed = collapsed || collapsedHunks.has(index);

    return {
      key: index,
      label: (
        <Space>
          <Typography.Text type="secondary">
            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
          </Typography.Text>
          {hunk.header && <Typography.Text>{hunk.header}</Typography.Text>}
        </Space>
      ),
      children: (
        <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
          {hunk.lines.map((line: string, lineIndex: number) => {
            const isOld = line.startsWith('-');
            const isNew = line.startsWith('+');
            const isContext = !isOld && !isNew;

            return (
              <div
                key={lineIndex}
                style={{
                  display: 'flex',
                  padding: '0 0.5rem',
                  backgroundColor: isOld 
                    ? 'color-mix(in srgb, var(--error) 10%, transparent)' 
                    : isNew 
                    ? 'color-mix(in srgb, var(--success) 10%, transparent)' 
                    : 'transparent',
                }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ minWidth: '60px', paddingRight: '0.75rem', textAlign: 'right' }}
                >
                  {mode === 'unified' && (isOld ? hunk.oldStart + lineIndex : isNew ? hunk.newStart + lineIndex : '')}
                  {mode === 'split' && (isOld ? hunk.oldStart + lineIndex : isNew ? hunk.newStart + lineIndex : '')}
                </Typography.Text>
                <Typography.Text style={{ flex: 1 }}>{line}</Typography.Text>
              </div>
            );
          })}
        </div>
      ),
    };
  });

  return (
    <Collapse
      items={items}
      defaultActiveKey={collapsed ? [] : items.map((_: any, i: number) => i)}
      onChange={(keys: React.Key[]) => {
        setCollapsedHunks(new Set(items.map((_: any, i: number) => i).filter((i: number) => !keys.includes(i))));
      }}
    />
  );
}

