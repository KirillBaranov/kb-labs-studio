/**
 * @module @kb-labs/studio-app/components/widgets/ChartPie
 * Pie Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import { WidgetCard } from './WidgetCard';
import type { BaseWidgetProps } from './types';
import { KBPieChart } from '@kb-labs/studio-ui-react';

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
  /** Maximum height for flexible charts (default: 600px) */
  maxHeight?: number;
  /** Show card wrapper (default: true) */
  showCard?: boolean;
}

export interface ChartPieProps extends BaseWidgetProps<ChartSeries[], ChartPieOptions> {}

export function ChartPie({ data, loading, error, options, title, description, showTitle = true, showDescription = false }: ChartPieProps) {
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
  const showPercent = options?.showPercent !== false;

  // Convert series to pie chart format
  const chartData = data.flatMap((series) =>
    series.points.map((point: { x: number | string; y: number }) => ({
      type: series.name,
      value: point.y,
    }))
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const chartContent = (
    <div 
      className="widget-chart-pie" 
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
        <KBPieChart
          data={chartData}
          angleField="value"
          colorField="type"
          height={fixedHeight || undefined}
          autoFit={!fixedHeight}
          legend={showLegend ? {} : false}
          tooltip={showTooltip ? {
            formatter: (datum: any) => ({
              name: datum.type,
              value: showPercent ? `${((datum.value / total) * 100).toFixed(1)}%` : datum.value,
            }),
          } : false}
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

