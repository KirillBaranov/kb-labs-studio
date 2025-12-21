/**
 * @module @kb-labs/studio-app/components/widgets/display/ChartArea
 * Area Chart widget
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState, WidgetCard } from '../shared/index';
import type { BaseWidgetProps } from '../types';
import type { ChartAreaOptions as ContractOptions, ChartAreaData } from '@kb-labs/studio-contracts';
import { KBAreaChart } from '@kb-labs/studio-ui-react';

export interface ChartAreaOptions extends ContractOptions {
  /** Show card wrapper (default: true) */
  showCard?: boolean;
  /** Maximum height for flexible charts (default: 600px) */
  maxHeight?: number;
}

export interface ChartAreaProps extends BaseWidgetProps<ChartAreaData, ChartAreaOptions> {}

export function ChartArea({
  data,
  loading,
  error,
  options,
  title,
  description,
  showTitle = true,
  showDescription = false,
}: ChartAreaProps) {
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

  if (!data?.series || data.series.length === 0) {
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
  const smooth = options?.smooth !== false;

  // Convert series to chart data format
  const chartData = data.series.flatMap((series) =>
    series.data.map((point) => ({
      x: point.x,
      y: point.y,
      series: series.name,
    }))
  );

  const chartContent = (
    <div
      className="widget-chart-area"
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
        <KBAreaChart
          data={chartData}
          xField="x"
          yField="y"
          seriesField="series"
          height={fixedHeight || undefined}
          autoFit={!fixedHeight}
          isStack={stacked}
          smooth={smooth}
          legend={showLegend ? {} : false}
          tooltip={showTooltip ? {} : false}
          areaStyle={{
            fillOpacity: options?.fillOpacity ?? 0.6,
          }}
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
