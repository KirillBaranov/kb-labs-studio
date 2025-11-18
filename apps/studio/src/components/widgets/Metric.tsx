/**
 * @module @kb-labs/studio-app/components/widgets/Metric
 * Metric widget - single metric with trend
 */

import * as React from 'react';
import { Card } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';
import type { KPIMetric } from './KPIList.js';

export interface MetricOptions {
  showDelta?: boolean;
  showSparkline?: boolean;
  compact?: boolean;
}

export interface MetricProps extends BaseWidgetProps<KPIMetric, MetricOptions> {}

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

  const { label, value, delta, unit, status } = data;
  const showDelta = options?.showDelta !== false;
  const compact = options?.compact === true;

  const valueStyle: React.CSSProperties = {};
  if (status === 'ok') valueStyle.color = 'var(--success)';
  else if (status === 'warn') valueStyle.color = 'var(--warning)';
  else if (status === 'crit') valueStyle.color = 'var(--error)';

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

