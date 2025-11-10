/**
 * @module @kb-labs/studio-app/components/widgets/Timeline
 * Timeline widget - events over time
 */

import * as React from 'react';
import { Timeline as AntTimeline, Typography, Button } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';

export interface TimelineEvent {
  ts: string | number | Date;
  title: string;
  description?: string;
  kind?: 'info' | 'success' | 'error' | string;
  link?: string;
}

export interface TimelineOptions {
  showIcons?: boolean;
  showLinks?: boolean;
  compact?: boolean;
}

export interface TimelineProps extends BaseWidgetProps<TimelineEvent[], TimelineOptions> {
  onEventClick?: (event: TimelineEvent) => void;
}

export function Timeline({ data, loading, error, options, onEventClick }: TimelineProps) {
  if (loading) {
    return <Skeleton variant="text" rows={5} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No events" description="No timeline events available" />;
  }

  const showIcons = options?.showIcons !== false;
  const showLinks = options?.showLinks !== false;
  const compact = options?.compact === true;

  const getStatusColor = (kind?: string): string => {
    if (kind === 'error') return 'red';
    if (kind === 'success') return 'green';
    return 'blue';
  };

  return (
    <AntTimeline mode={compact ? 'left' : 'left'} style={{ paddingLeft: compact ? '1rem' : '1.5rem' }}>
      {data.map((event, index) => (
        <AntTimeline.Item
          key={index}
          color={getStatusColor(event.kind)}
          dot={showIcons && event.kind ? (
            <span style={{ fontSize: '0.875rem' }}>
              {event.kind === 'error' ? '⚠️' : event.kind === 'success' ? '✅' : 'ℹ️'}
            </span>
          ) : undefined}
        >
          <div style={{ marginBottom: '0.5rem' }}>
            <Typography.Text type="secondary" style={{ fontSize: '0.75rem' }}>
              {new Date(event.ts).toLocaleString()}
            </Typography.Text>
          </div>
          <Typography.Title level={5} style={{ margin: '0.5rem 0' }}>
            {event.title}
          </Typography.Title>
          {event.description && (
            <Typography.Text type="secondary" style={{ fontSize: '0.875rem', display: 'block', marginBottom: '0.5rem' }}>
              {event.description}
            </Typography.Text>
          )}
          {showLinks && event.link && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                onEventClick?.(event);
              }}
            >
              View details →
            </Button>
          )}
        </AntTimeline.Item>
      ))}
    </AntTimeline>
  );
}

