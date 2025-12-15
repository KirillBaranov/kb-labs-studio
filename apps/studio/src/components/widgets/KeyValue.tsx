/**
 * @module @kb-labs/studio-app/components/widgets/KeyValue
 * KeyValue widget - simple key-value list with type-based formatting
 */

import * as React from 'react';
import { Descriptions, Tag, Space, Typography } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import type { BaseWidgetProps } from './types';
import type { KeyValueData } from '@kb-labs/rest-api-contracts';

const { Text } = Typography;

export interface KeyValueOptions {
  layout?: 'horizontal' | 'vertical';
  column?: number;
  bordered?: boolean;
}

export interface KeyValueProps extends BaseWidgetProps<KeyValueData, KeyValueOptions> {}

export function KeyValue({ data, loading, error, options }: KeyValueProps) {
  if (loading) {
    return <Skeleton variant="text" rows={5} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || !data.items || data.items.length === 0) {
    return <EmptyState title="No data" description="No key-value items available" />;
  }

  const layout = options?.layout || 'horizontal';
  const column = options?.column || 2;
  const bordered = options?.bordered !== false;

  const renderValue = (item: KeyValueData['items'][0]) => {
    const { value, type } = item;

    if (type === 'badge') {
      // Determine badge color based on value
      const badgeColor = typeof value === 'string' && (
        value.toLowerCase().includes('ok') || 
        value.toLowerCase().includes('success') ||
        value === 'true'
      ) ? 'success' : 
      typeof value === 'string' && (
        value.toLowerCase().includes('error') || 
        value.toLowerCase().includes('fail')
      ) ? 'error' : 
      typeof value === 'string' && (
        value.toLowerCase().includes('warn') || 
        value.toLowerCase().includes('warning')
      ) ? 'warning' : 'default';

      return <Tag color={badgeColor}>{String(value)}</Tag>;
    }

    if (type === 'boolean') {
      return <Tag color={value ? 'success' : 'default'}>{String(value)}</Tag>;
    }

    if (type === 'number') {
      return <Text style={{ fontFamily: 'monospace' }}>{String(value)}</Text>;
    }

    return <Text>{String(value)}</Text>;
  };

  if (layout === 'vertical') {
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        {data.items.map((item, index) => (
          <div key={`item-${index}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Text strong style={{ minWidth: '150px' }}>{item.key}:</Text>
            {renderValue(item)}
          </div>
        ))}
      </Space>
    );
  }

  // Horizontal layout using Descriptions
  return (
    <Descriptions
      column={column}
      bordered={bordered}
      size="small"
      items={data.items.map((item) => ({
        key: item.key,
        label: item.key,
        children: renderValue(item),
      }))}
    />
  );
}


