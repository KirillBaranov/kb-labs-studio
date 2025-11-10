/**
 * @module @kb-labs/studio-app/components/widgets/ChartLine
 * Line Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';
import { KBLineChart } from '@kb-labs/ui-react';

export interface ChartSeriesPoint {
  x: number | string;
  y: number;
}

export interface ChartSeries {
  name: string;
  points: ChartSeriesPoint[];
}

export interface ChartLineOptions {
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
}

export interface ChartLineProps extends BaseWidgetProps<ChartSeries[] | { series: ChartSeries[] }, ChartLineOptions> {}

export function ChartLine({ data, loading, error, options }: ChartLineProps) {
  if (loading) {
    return <Skeleton variant="chart" />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const seriesArray: ChartSeries[] = Array.isArray(data)
    ? data
    : data && 'series' in data
      ? (data.series as ChartSeries[])
      : [];

  if (!seriesArray || seriesArray.length === 0) {
    return <EmptyState title="No data" description="No chart data available" />;
  }

  const showLegend = options?.showLegend !== false;
  const showTooltip = options?.showTooltip !== false;
  const height = options?.height || 300;

  const chartData = seriesArray.flatMap((series) =>
    series.points.map((point: { x: number | string; y: number }) => ({
      x: point.x,
      y: point.y,
      series: series.name,
    }))
  );

  return (
    <div className="widget-chart-line">
      <KBLineChart
        data={chartData}
        xField="x"
        yField="y"
        seriesField="series"
        height={height}
        legend={showLegend ? {} : false}
        tooltip={showTooltip ? {} : false}
      />
    </div>
  );
}

