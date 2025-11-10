/**
 * @module @kb-labs/studio-app/components/widgets/KPIList
 * KPI List widget - set of KPI cards
 */

import * as React from 'react';
import { Card, Row, Col } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';

export interface KPIMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  status?: 'ok' | 'warn' | 'crit' | 'default';
  delta?: number;
}

export interface KPIListOptions {
  columns?: number;
  compact?: boolean;
}

export interface KPIListProps extends BaseWidgetProps<KPIMetric[], KPIListOptions> {}

export function KPIList({ data, loading, error, options }: KPIListProps) {
  if (loading) {
    return <Skeleton variant="card" rows={3} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No KPIs" description="No KPI data available" />;
  }

  const columns = options?.columns || 3;
  const compact = options?.compact === true;

  const statusColors: Record<string, string> = {
    ok: '#52c41a',
    warn: '#faad14',
    crit: '#f5222d',
  };

  const span = 24 / columns;

  return (
    <Row gutter={[16, 16]}>
      {data.map((kpi) => (
        <Col key={kpi.id} span={span}>
          <Card size={compact ? 'small' : 'default'} style={{ height: '100%' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: statusColors[kpi.status || 'default'] || '#333' }}>
              {kpi.value}
              {kpi.unit && <span style={{ fontSize: '0.875rem', fontWeight: 400, marginLeft: '0.5rem' }}>{kpi.unit}</span>}
            </div>
            {kpi.delta !== undefined && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: kpi.delta >= 0 ? '#52c41a' : '#f5222d' }}>
                {kpi.delta >= 0 ? '↑' : '↓'} {Math.abs(kpi.delta)}
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
}

