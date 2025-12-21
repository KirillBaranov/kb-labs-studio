/**
 * @module @kb-labs/studio-app/components/widgets/display/Card
 * Card widget - single info card
 */

import * as React from 'react';
import { Card as AntCard, Typography, Tag, Space, Avatar } from 'antd';
import { Skeleton, EmptyState, ErrorState } from '../shared/index';
import type { BaseWidgetProps } from '../types';
import type { CardOptions as ContractOptions, CardData } from '@kb-labs/studio-contracts';

const { Text, Paragraph } = Typography;

export interface CardOptions extends ContractOptions {}

export interface CardProps extends BaseWidgetProps<CardData, CardOptions> {
  onClick?: () => void;
}

export function Card({ data, loading, error, options, onClick }: CardProps) {
  if (loading || options?.loading) {
    return (
      <AntCard>
        <Skeleton variant="card" rows={3} />
      </AntCard>
    );
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data) {
    return <EmptyState title="No data" description="No card data available" />;
  }

  const { title, description, cover, avatar, meta, tags, footer, href, status } = data;
  const { variant = 'default', padding = 'md', clickable, showHeader = true, showFooter = true, coverPosition = 'top' } = options ?? {};

  const statusColors: Record<string, string> = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    default: 'var(--border-primary)',
  };

  const paddingMap: Record<string, string> = {
    none: '0',
    sm: '12px',
    md: '16px',
    lg: '24px',
  };

  const cardStyle: React.CSSProperties = {
    height: '100%',
    borderLeft: status ? `4px solid ${statusColors[status]}` : undefined,
  };

  if (variant === 'outlined') {
    cardStyle.boxShadow = 'none';
  } else if (variant === 'elevated') {
    cardStyle.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  }

  const handleClick = () => {
    if (clickable || href) {
      if (href) {
        window.open(href, '_blank');
      } else {
        onClick?.();
      }
    }
  };

  return (
    <AntCard
      style={cardStyle}
      hoverable={clickable || !!href}
      onClick={handleClick}
      cover={cover && coverPosition === 'top' ? <img alt={title} src={cover} style={{ objectFit: 'cover', maxHeight: 200 }} /> : undefined}
      bodyStyle={{ padding: paddingMap[padding] }}
    >
      {showHeader && (avatar || title) && (
        <AntCard.Meta
          avatar={avatar ? <Avatar src={avatar} size={40} /> : undefined}
          title={title}
          description={description && (
            <Paragraph ellipsis={{ rows: 3 }} style={{ margin: 0 }}>
              {description}
            </Paragraph>
          )}
        />
      )}

      {meta && meta.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {meta.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <Text type="secondary">{item.label}</Text>
              <Text>{item.value}</Text>
            </div>
          ))}
        </div>
      )}

      {tags && tags.length > 0 && (
        <Space wrap style={{ marginTop: '12px' }}>
          {tags.map((tag, index) => (
            <Tag key={index} color={tag.color}>
              {tag.label}
            </Tag>
          ))}
        </Space>
      )}

      {showFooter && footer && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-primary)' }}>
          <Text type="secondary">{footer}</Text>
        </div>
      )}
    </AntCard>
  );
}
