/**
 * @module @kb-labs/studio-app/components/widgets/CardList
 * Card List widget - entity cards
 */

import * as React from 'react';
import { Card, Tag, Space } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';

export interface CardItem {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  status?: 'ok' | 'warn' | 'crit';
  meta?: Record<string, unknown>;
}

export interface CardListOptions {
  columns?: number;
  compact?: boolean;
}

export interface CardListProps extends BaseWidgetProps<CardItem[], CardListOptions> {
  onCardClick?: (card: CardItem) => void;
}

export function CardList({ data, loading, error, options, onCardClick }: CardListProps) {
  if (loading) {
    return <Skeleton variant="card" rows={3} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No cards" description="No card data available" />;
  }

  const columns = options?.columns || 3;
  const compact = options?.compact === true;

  const statusColors: Record<string, string> = {
    ok: '#52c41a',
    warn: '#faad14',
    crit: '#f5222d',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }}>
      {data.map((card) => (
        <Card
          key={card.id}
          size={compact ? 'small' : 'default'}
          hoverable={!!onCardClick}
          onClick={() => onCardClick?.(card)}
          style={{
            borderLeft: card.status ? `4px solid ${statusColors[card.status]}` : undefined,
          }}
        >
          <Card.Meta
            title={card.title}
            description={card.description}
          />
          {card.tags && card.tags.length > 0 && (
            <Space wrap style={{ marginTop: '0.75rem' }}>
              {card.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          )}
        </Card>
      ))}
    </div>
  );
}

