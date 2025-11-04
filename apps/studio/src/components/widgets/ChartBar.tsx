/**
 * @module @kb-labs/studio-app/components/widgets/ChartBar
 * Bar Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';
import type { ChartSeries } from '@kb-labs/api-contracts';
import { KBColumnChart } from '@kb-labs/ui-react';

export interface ChartBarOptions {
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  stacked?: boolean;
}

export interface ChartBarProps extends BaseWidgetProps<ChartSeries[], ChartBarOptions> {}

export function ChartBar({ data, loading, error, options }: ChartBarProps) {
  if (loading) {
    return <Skeleton variant="chart" />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No data" description="No chart data available" />;
  }

  const showLegend = options?.showLegend !== false;
  const showTooltip = options?.showTooltip !== false;
  const height = options?.height || 300;
  const stacked = options?.stacked === true;

  const chartData = data.flatMap((series) =>
    series.points.map((point: { x: number | string; y: number }) => ({
      x: point.x,
      y: point.y,
      series: series.name,
    }))
  );

  return (
    <div className="widget-chart-bar">
      <KBColumnChart
        data={chartData}
        xField="x"
        yField="y"
        seriesField={stacked ? "series" : undefined}
        height={height}
        isStack={stacked}
        legend={showLegend ? {} : false}
        tooltip={showTooltip ? {} : false}
      />
    </div>
  );
}

