/**
 * @module @kb-labs/studio-app/components/page-header
 * Page header component for plugin pages with title, description, and optional actions
 */

import * as React from 'react';
import { Typography } from 'antd';
import type { ReactNode } from 'react';
import type { WidgetAction } from '@kb-labs/studio-contracts';
import { ActionToolbar } from './action-toolbar';

const { Title, Text } = Typography;

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Optional actions (buttons, dropdowns, etc.) */
  actions?: ReactNode;
  /** Widget actions (will be rendered as ActionToolbar) */
  widgetActions?: WidgetAction[];
  /** Widget ID for actions */
  widgetId?: string;
  /** Plugin ID for actions */
  pluginId?: string;
  /** Optional breadcrumbs */
  breadcrumbs?: ReactNode;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

/**
 * PageHeader - displays page title, description, and optional actions
 */
export function PageHeader({
  title,
  description,
  actions,
  widgetActions,
  widgetId,
  pluginId,
  breadcrumbs,
  className,
  style,
}: PageHeaderProps): React.ReactElement {
  return (
    <div
      className={className}
      style={{
        marginBottom: '24px',
        ...style,
      }}
    >
      {breadcrumbs && (
        <div style={{ marginBottom: '12px' }}>{breadcrumbs}</div>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title
            level={1}
            className="typo-page-title"
            style={{
              margin: 0,
              marginBottom: description ? '8px' : 0,
              color: 'var(--text-primary)',
            }}
          >
            {title}
          </Title>
          {description && (
            <Text
              className="typo-description"
              style={{
                color: 'var(--text-secondary)',
                display: 'block',
              }}
            >
              {description}
            </Text>
          )}
        </div>
        {(actions || widgetActions) && (
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {actions}
            {widgetActions && (
              <ActionToolbar
                actions={widgetActions}
                widgetId={widgetId}
                pluginId={pluginId}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

