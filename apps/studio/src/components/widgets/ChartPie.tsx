/**
 * @module @kb-labs/studio-app/components/widgets/ChartPie
 * Pie Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';
import { KBPieChart } from '@kb-labs/ui-react';

export interface ChartSeriesPoint {
  x: number | string;
  y: number;
}

export interface ChartSeries {
  name: string;
  points: ChartSeriesPoint[];
}

export interface ChartPieOptions {
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  showPercent?: boolean;
}

export interface ChartPieProps extends BaseWidgetProps<ChartSeries[], ChartPieOptions> {}

export function ChartPie({ data, loading, error, options }: ChartPieProps) {
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
  const showPercent = options?.showPercent !== false;

  // Convert series to pie chart format
  const chartData = data.flatMap((series) =>
    series.points.map((point: { x: number | string; y: number }) => ({
      type: series.name,
      value: point.y,
    }))
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="widget-chart-pie">
      <KBPieChart
        data={chartData}
        angleField="value"
        colorField="type"
        height={height}
        legend={showLegend ? {} : false}
        tooltip={showTooltip ? {
          formatter: (datum: any) => ({
            name: datum.type,
            value: showPercent ? `${((datum.value / total) * 100).toFixed(1)}%` : datum.value,
          }),
        } : false}
      />
    </div>
  );
}

