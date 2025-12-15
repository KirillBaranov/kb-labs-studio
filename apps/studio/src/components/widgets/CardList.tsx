/**
 * @module @kb-labs/studio-app/components/widgets/CardList
 * Card List widget - universal card renderer supporting multiple formats
 */

import * as React from 'react';
import { Card, Tag, Space, Typography } from 'antd';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import type { BaseWidgetProps } from './types';
import type { CardListData, CardData } from '@kb-labs/rest-api-contracts';

// Legacy format (backward compatibility)
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
  layout?: 'grid' | 'list';
}

export interface CardListProps extends BaseWidgetProps<CardListData | CardItem[], CardListOptions> {
  onCardClick?: (card: CardData | CardItem) => void;
}

export function CardList({ data, loading, error, options, onCardClick }: CardListProps) {
  if (loading) {
    return <Skeleton variant="card" rows={3} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Normalize data format
  let cards: Array<CardData | CardItem> = [];
  if (!data) {
    return <EmptyState title="No cards" description="No card data available" />;
  }

  // Extract cards from response (handle both direct format and wrapped format)
  // Data can come in different formats:
  // 1. { cards: [...] } - direct CardListData
  // 2. { ok: true/false, cards: [...] } - wrapped with ok flag
  // 3. [...] - legacy array format
  
  if (typeof data === 'object' && data !== null) {
    // Check if it's CardListData format
    if ('cards' in data && Array.isArray((data as any).cards)) {
      cards = (data as CardListData).cards;
    } else if (Array.isArray(data)) {
      // Legacy format (CardItem[])
      cards = data;
    } else {
      return <EmptyState title="Invalid data format" description="Card data must be an array or CardListData object" />;
    }
  } else if (Array.isArray(data)) {
    // Legacy format (CardItem[])
    cards = data;
  } else {
    return <EmptyState title="Invalid data format" description="Card data must be an array or CardListData object" />;
  }

  if (cards.length === 0) {
    return <EmptyState title="No cards" description="No card data available" />;
  }

  const columns = options?.columns || 3;
  const compact = options?.compact === true;
  const layout = options?.layout || 'grid';

  const statusColors: Record<string, string> = {
    ok: 'var(--success)',
    warn: 'var(--warning)',
    crit: 'var(--error)',
    error: 'var(--error)',
    info: 'var(--info)',
  };

  const isNewFormat = (card: CardData | CardItem): card is CardData => {
    return 'content' in card;
  };

  const getCardId = (card: CardData | CardItem, index: number): string => {
    if (isNewFormat(card)) {
      return `card-${index}`;
    }
    return card.id || `card-${index}`;
  };

  const getCardTitle = (card: CardData | CardItem): string => {
    return card.title;
  };

  const getCardDescription = (card: CardData | CardItem): string | undefined => {
    if (isNewFormat(card)) {
      return card.content;
    }
    return card.description;
  };

  const getCardStatus = (card: CardData | CardItem): string | undefined => {
    return card.status;
  };

  const getCardTags = (card: CardData | CardItem): string[] | undefined => {
    if (!isNewFormat(card)) {
      return card.tags;
    }
    return undefined;
  };

  const cardStyle: React.CSSProperties = layout === 'list' 
    ? { marginBottom: '1rem' }
    : {};

  return (
    <div style={layout === 'grid' 
      ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '1rem' }
      : { display: 'flex', flexDirection: 'column', gap: '1rem' }
    }>
      {cards.map((card, index) => {
        const cardId = getCardId(card, index);
        const title = getCardTitle(card);
        const description = getCardDescription(card);
        const status = getCardStatus(card);
        const tags = getCardTags(card);

        return (
          <Card
            key={cardId}
            size={compact ? 'small' : 'default'}
            hoverable={!!onCardClick}
            onClick={() => onCardClick?.(card)}
            style={{
              ...cardStyle,
              borderLeft: status ? `4px solid ${statusColors[status] || 'var(--border-primary)'}` : undefined,
            }}
          >
            <Card.Meta
              title={title}
              description={
                description ? (
                  <Typography.Paragraph 
                    style={{ margin: 0, whiteSpace: 'pre-wrap' }}
                    ellipsis={{ rows: 3, expandable: true }}
                  >
                    {description}
                  </Typography.Paragraph>
                ) : undefined
              }
            />
            {tags && tags.length > 0 && (
              <Space wrap style={{ marginTop: '0.75rem' }}>
                {tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
            )}
          </Card>
        );
      })}
    </div>
  );
}

