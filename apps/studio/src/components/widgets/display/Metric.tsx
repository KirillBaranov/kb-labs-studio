/**
 * @module @kb-labs/studio-app/components/widgets/display/Metric
 * Metric widget - single metric with trend
 *
 * 🎯 REFACTORED: Now uses UI Kit components (MetricCard)
 * - NO inline styles
 * - Uses Ant Design tokens for colors
 * - Uses design system spacing/typography
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from '../shared/index';
import { MetricCard } from '../../../ui';
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
  const size = options?.size === 'small' ? 'small' : 'default';

  return (
    <MetricCard
      label={label}
      value={value}
      trend={trend}
      delta={delta}
      unit={unit}
      size={size}
      showDelta={showDelta}
    />
  );
}

