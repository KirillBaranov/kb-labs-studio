/**
 * @module @kb-labs/studio-app/components/widgets/display/MetricGroup
 * MetricGroup widget - displays multiple metrics in a row/grid
 */

import * as React from 'react';
import { Row, Col, Card } from 'antd';
import { Skeleton, EmptyState, ErrorState } from '../shared/index';
import type { BaseWidgetProps } from '../types';
import type {
  MetricGroupOptions as ContractOptions,
  MetricGroupData,
  MetricData,
} from '@kb-labs/studio-contracts';

export interface MetricGroupOptions extends ContractOptions {}

export interface MetricGroupProps extends BaseWidgetProps<MetricGroupData, MetricGroupOptions> {}

function SingleMetric({ metric, options }: { metric: MetricData; options?: ContractOptions['metricDefaults'] }) {
  const { value, label, unit, trend, trendValue, status } = metric;

  const valueStyle: React.CSSProperties = {};
  if (status === 'success') {valueStyle.color = 'var(--success)';}
  else if (status === 'warning') {valueStyle.color = 'var(--warning)';}
  else if (status === 'error') {valueStyle.color = 'var(--error)';}

  const trendColor = trend === 'up' ? 'var(--success)' : trend === 'down' ? 'var(--error)' : 'var(--text-secondary)';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <Card size="small" style={{ height: '100%' }}>
      {label && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          {label}
        </div>
      )}
      <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, ...valueStyle }}>
        {value}
        {unit && <span style={{ fontSize: '0.875rem', fontWeight: 400, marginLeft: '0.25rem' }}>{unit}</span>}
      </div>
      {trend && (
        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: trendColor }}>
          {trendIcon} {trendValue || ''}
        </div>
      )}
    </Card>
  );
}

export function MetricGroup({ data, loading, error, options }: MetricGroupProps) {
  if (loading) {
    return <Skeleton variant="card" rows={1} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data?.metrics || data.metrics.length === 0) {
    return <EmptyState title="No metrics" description="No metric data available" />;
  }

  const columns = typeof options?.columns === 'number'
    ? options.columns
    : options?.columns?.md ?? 4;
  const gap = options?.gap ?? 16;

  const span = Math.floor(24 / columns);

  return (
    <Row gutter={[gap, gap]}>
      {data.metrics.map((metric, index) => (
        <Col key={index} span={span}>
          <SingleMetric metric={metric} options={options?.metricDefaults} />
        </Col>
      ))}
    </Row>
  );
}
