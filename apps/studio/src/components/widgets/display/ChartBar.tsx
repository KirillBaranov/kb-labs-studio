/**
 * @module @kb-labs/studio-app/components/widgets/ChartBar
 * Bar Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState, WidgetCard } from '../shared/index';
import type { BaseWidgetProps } from '../types';
import { KBColumnChart } from '@kb-labs/studio-ui-react';

export interface ChartSeriesPoint {
  x: number | string;
  y: number;
}

export interface ChartSeries {
  name: string;
  points: ChartSeriesPoint[];
}

export interface ChartBarOptions {
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  stacked?: boolean;
  /** Maximum height for flexible charts (default: 600px) */
  maxHeight?: number;
  /** Show card wrapper (default: true) */
  showCard?: boolean;
}

export interface ChartBarProps extends BaseWidgetProps<ChartSeries[], ChartBarOptions> {}

export function ChartBar({ data, loading, error, options, title, description, showTitle = true, showDescription = false }: ChartBarProps) {
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

  if (!data || data.length === 0) {
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
  const fixedHeight = options?.height;
  const minHeight = fixedHeight || 300;
  const maxHeight = options?.maxHeight || 600;
  const stacked = options?.stacked === true;

  const chartData = data.flatMap((series) =>
    series.points.map((point: { x: number | string; y: number }) => ({
      x: point.x,
      y: point.y,
      series: series.name,
    }))
  );

  const chartContent = (
    <div 
      className="widget-chart-bar" 
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
        <KBColumnChart
          data={chartData}
          xField="x"
          yField="y"
          seriesField={stacked ? "series" : undefined}
          height={fixedHeight || undefined}
          autoFit={!fixedHeight}
          isStack={stacked}
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

