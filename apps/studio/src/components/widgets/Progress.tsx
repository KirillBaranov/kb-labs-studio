/**
 * @module @kb-labs/studio-app/components/widgets/Progress
 * Progress widget - progress bars (multi/stacked)
 */

import * as React from 'react';
import { Progress as AntProgress, Space, Typography } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import type { BaseWidgetProps } from './types';

export interface ProgressItem {
  id: string;
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export interface ProgressOptions {
  stacked?: boolean;
  showLabels?: boolean;
  showValues?: boolean;
}

export interface ProgressProps extends BaseWidgetProps<ProgressItem[], ProgressOptions> {}

export function Progress({ data, loading, error, options }: ProgressProps) {
  if (loading) {
    return <Skeleton variant="text" rows={3} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No progress data" description="No progress data available" />;
  }

  const stacked = options?.stacked === true;
  const showLabels = options?.showLabels !== false;
  const showValues = options?.showValues !== false;

  if (stacked) {
    const segments = data.map((item) => ({
      percent: ((item.value / (item.max || 100)) * 100),
      color: item.color || 'var(--info)',
    }));

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <AntProgress
          percent={100}
          strokeColor={segments.map((s) => s.color)}
          success={{ percent: 0 }}
          showInfo={false}
        />
        {showLabels && (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {data.map((item) => (
              <Typography.Text key={item.id} style={{ fontSize: '0.875rem' }}>
                {item.label}
                {showValues && `: ${item.value}/${item.max || 100}`}
              </Typography.Text>
            ))}
          </Space>
        )}
      </Space>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      {data.map((item) => {
        const percent = ((item.value / (item.max || 100)) * 100);

        return (
          <div key={item.id}>
            {showLabels && (
              <Typography.Text style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                {item.label}
                {showValues && `: ${item.value}/${item.max || 100}`}
              </Typography.Text>
            )}
            <AntProgress
              percent={percent}
              strokeColor={item.color || 'var(--info)'}
              showInfo={showValues}
            />
          </div>
        );
      })}
    </Space>
  );
}

