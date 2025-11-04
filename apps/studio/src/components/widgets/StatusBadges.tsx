/**
 * @module @kb-labs/studio-app/components/widgets/StatusBadges
 * Status Badges widget - list/cloud of status badges
 */

import * as React from 'react';
import { Tag, Space } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';

export interface StatusBadge {
  id: string;
  label: string;
  status: 'ok' | 'warn' | 'crit';
  count?: number;
}

export interface StatusBadgesOptions {
  layout?: 'list' | 'cloud';
  showCount?: boolean;
}

export interface StatusBadgesProps extends BaseWidgetProps<StatusBadge[], StatusBadgesOptions> {}

export function StatusBadges({ data, loading, error, options }: StatusBadgesProps) {
  if (loading) {
    return <Skeleton variant="text" rows={3} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No status badges" description="No status data available" />;
  }

  const layout = options?.layout || 'list';
  const showCount = options?.showCount !== false;

  const statusColors: Record<string, string> = {
    ok: 'success',
    warn: 'warning',
    crit: 'error',
  };

  return (
    <Space wrap={layout === 'cloud'} style={{ width: '100%', justifyContent: layout === 'cloud' ? 'center' : 'flex-start' }}>
      {data.map((badge) => (
        <Tag key={badge.id} color={statusColors[badge.status] || 'default'}>
          {badge.label}
          {showCount && badge.count !== undefined && ` (${badge.count})`}
        </Tag>
      ))}
    </Space>
  );
}

