/**
 * @module @kb-labs/studio-app/components/widgets/display/Metric
 * Metric widget - single metric with trend
 */

import * as React from 'react';
import { Card } from 'antd';
import { Skeleton, EmptyState, ErrorState } from '../shared/index';
import type { BaseWidgetProps } from '../types';
import type { MetricData, MetricOptions as ContractOptions } from '@kb-labs/studio-contracts';

export interface MetricOptions extends ContractOptions {}

export interface MetricProps extends BaseWidgetProps<MetricData, MetricOptions> {}

export function Metric({ data, loading, error, options }: MetricProps) {
  if (loading) {
    return <Skeleton variant="text" rows={2} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data) {
    return <EmptyState title="No data" description="No metric data available" />;
  }

  const { label, value, delta, unit, trend } = data;
  const showDelta = options?.showTrend !== false;
  const compact = options?.size === 'small';

  const valueStyle: React.CSSProperties = {};
  if (trend === 'up') valueStyle.color = 'var(--success)';
  else if (trend === 'down') valueStyle.color = 'var(--error)';

  return (
    <Card size={compact ? 'small' : 'default'} style={{ height: '100%' }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, ...valueStyle }}>
        {value}
        {unit && <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: '0.5rem' }}>{unit}</span>}
      </div>
      {showDelta && delta !== undefined && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: delta >= 0 ? 'var(--success)' : 'var(--error)' }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}
        </div>
      )}
    </Card>
  );
}

