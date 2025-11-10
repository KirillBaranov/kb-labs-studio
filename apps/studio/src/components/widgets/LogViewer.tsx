/**
 * @module @kb-labs/studio-app/components/widgets/LogViewer
 * Log Viewer widget - lazy virtualized list
 */

import * as React from 'react';
import { Input, List, Typography, Space, Tag } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';

export interface LogLine {
  ts: string | number | Date;
  level: 'debug' | 'info' | 'warn' | 'error' | string;
  msg: string;
}

export interface LogViewerOptions {
  showTimestamp?: boolean;
  showLevel?: boolean;
  searchable?: boolean;
  maxLines?: number;
}

export interface LogViewerProps extends BaseWidgetProps<LogLine[], LogViewerOptions> {}

export function LogViewer({ data, loading, error, options }: LogViewerProps) {
  const [search, setSearch] = React.useState('');

  if (loading) {
    return <Skeleton variant="text" rows={10} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No logs" description="No log data available" />;
  }

  const showTimestamp = options?.showTimestamp !== false;
  const showLevel = options?.showLevel !== false;
  const searchable = options?.searchable === true;
  const maxLines = options?.maxLines || 1000;

  const filteredData = searchable && search
    ? data.filter((line) => line.msg.toLowerCase().includes(search.toLowerCase()))
    : data.slice(0, maxLines);

  const levelColors: Record<string, string> = {
    debug: 'default',
    info: 'processing',
    warn: 'warning',
    error: 'error',
  };

  return (
    <Space direction="vertical" style={{ width: '100%', height: '100%', maxHeight: '600px' }}>
      {searchable && (
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
        />
      )}
      <List
        dataSource={filteredData}
        style={{ flex: 1, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.875rem' }}
        renderItem={(line, index) => {
          const color = levelColors[line.level] || 'default';
          return (
            <List.Item
              key={index}
              style={{
                padding: '0.5rem 0',
                borderBottom: '1px solid #f0f0f0',
                color: line.level === 'error' ? '#f5222d' : line.level === 'warn' ? '#faad14' : '#333',
              }}
            >
              <Space split="|" style={{ width: '100%' }}>
                {showTimestamp && (
                  <Typography.Text type="secondary" style={{ minWidth: '80px' }}>
                    {new Date(line.ts).toLocaleTimeString()}
                  </Typography.Text>
                )}
                {showLevel && (
                  <Tag color={color} style={{ minWidth: '60px' }}>
                    {line.level}
                  </Tag>
                )}
                <Typography.Text style={{ flex: 1 }}>{line.msg}</Typography.Text>
              </Space>
            </List.Item>
          );
        }}
      />
    </Space>
  );
}

