/**
 * @module @kb-labs/studio-app/components/widgets/WidgetCard
 * Widget card wrapper - wraps widgets in Ant Design Card with title and description
 */

import * as React from 'react';
import { Card, Typography } from 'antd';
import type { CardProps } from 'antd';
import type { WidgetAction } from '@kb-labs/studio-contracts';
import { ActionToolbar } from '../../action-toolbar';

const { Title, Text } = Typography;

export interface WidgetCardProps extends Omit<CardProps, 'title'> {
  /** Widget title */
  title?: string;
  /** Widget description */
  description?: string;
  /** Children to render inside card */
  children: React.ReactNode;
  /** Show title even if empty */
  showTitle?: boolean;
  /** Show description in card header */
  showDescription?: boolean;
  /** Minimum height */
  minHeight?: number | string;
  /** Maximum height */
  maxHeight?: number | string;
  /** Widget actions (rendered in card header) */
  actions?: WidgetAction[];
  /** Widget ID for actions */
  widgetId?: string;
  /** Plugin ID for actions */
  pluginId?: string;
  /** Card body style */
  bodyStyle?: React.CSSProperties;
}

/**
 * WidgetCard - wraps widget content in a card with optional title and description
 */
export function WidgetCard({
  title,
  description,
  children,
  showTitle = false,
  showDescription = false,
  minHeight,
  maxHeight,
  actions,
  widgetId,
  pluginId,
  bodyStyle,
  ...cardProps
}: WidgetCardProps) {
  const hasTitle = title && title.trim().length > 0;
  const hasDescription = description && description.trim().length > 0;
  const shouldShowTitle = hasTitle && showTitle;
  const shouldShowDescription = hasDescription && showDescription;

  const cardTitle = shouldShowTitle || shouldShowDescription ? (
    <div>
      {shouldShowTitle && (
        <Title level={5} style={{ margin: 0, marginBottom: shouldShowDescription ? 4 : 0 }}>
          {title}
        </Title>
      )}
      {shouldShowDescription && (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {description}
        </Text>
      )}
    </div>
  ) : undefined;

  const cardStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    ...(minHeight && { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }),
    ...(maxHeight && { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }),
    ...cardProps.style,
  };

  const cardExtra = actions && actions.length > 0 ? (
    <ActionToolbar
      actions={actions}
      widgetId={widgetId}
      pluginId={pluginId}
      size="small"
    />
  ) : cardProps.extra;

  return (
    <Card
      {...cardProps}
      title={cardTitle}
      extra={cardExtra}
      bodyStyle={{
        padding: '16px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: maxHeight ? 'auto' : 'visible',
        ...bodyStyle,
      }}
      style={cardStyle}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </div>
    </Card>
  );
}

