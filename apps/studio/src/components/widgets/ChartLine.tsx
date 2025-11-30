/**
 * @module @kb-labs/studio-app/components/widgets/ChartLine
 * Line Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import { WidgetCard } from './WidgetCard';
import type { BaseWidgetProps } from './types';
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
  /** Maximum height for flexible charts (default: 600px) */
  maxHeight?: number;
  /** Show card wrapper (default: true) */
  showCard?: boolean;
}

export interface ChartLineProps extends BaseWidgetProps<ChartSeries[] | { series: ChartSeries[] }, ChartLineOptions> {}

export function ChartLine({ data, loading, error, options, title, description, showTitle = true, showDescription = false }: ChartLineProps) {
  const showCard = options?.showCard !== false;

  if (loading) {
    const content = <Skeleton variant="chart" />;
    return showCard ? (
      <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
        {content}
      </WidgetCard>
    ) : (
      content
    );
  }

  if (error) {
    const content = <ErrorState error={error} />;
    return showCard ? (
      <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
        {content}
      </WidgetCard>
    ) : (
      content
    );
  }

  const seriesArray: ChartSeries[] = Array.isArray(data)
    ? data
    : data && 'series' in data
      ? (data.series as ChartSeries[])
      : [];

  if (!seriesArray || seriesArray.length === 0) {
    const content = <EmptyState title="No data" description="No chart data available" />;
    return showCard ? (
      <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
        {content}
      </WidgetCard>
    ) : (
      content
    );
  }

  const showLegend = options?.showLegend !== false;
  const showTooltip = options?.showTooltip !== false;
  // Use fixed height if provided, otherwise use min-height for flexible sizing
  const fixedHeight = options?.height;
  const minHeight = fixedHeight || 300;
  const maxHeight = options?.maxHeight || 600;

  const chartData = seriesArray.flatMap((series) =>
    series.points.map((point: { x: number | string; y: number }) => ({
      x: point.x,
      y: point.y,
      series: series.name,
    }))
  );

  const chartContent = (
    <div 
      className="widget-chart-line" 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: `${minHeight}px`,
        maxHeight: fixedHeight ? undefined : `${maxHeight}px`,
        height: fixedHeight ? `${fixedHeight}px` : '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, maxHeight: '100%', width: '100%', overflow: 'hidden' }}>
        <KBLineChart
          data={chartData}
          xField="x"
          yField="y"
          seriesField="series"
          height={fixedHeight || undefined}
          autoFit={!fixedHeight}
          legend={showLegend ? {} : false}
          tooltip={showTooltip ? {} : false}
        />
      </div>
    </div>
  );

  return showCard ? (
    <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
      {chartContent}
    </WidgetCard>
  ) : (
    chartContent
  );
}

