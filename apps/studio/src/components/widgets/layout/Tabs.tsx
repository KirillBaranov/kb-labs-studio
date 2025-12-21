/**
 * @module @kb-labs/studio-app/components/widgets/layout/Tabs
 * Tabs widget - tab container
 */

import * as React from 'react';
import { Tabs as AntTabs, Badge } from 'antd';
import type { TabsProps as AntTabsProps } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { TabsOptions as ContractOptions } from '@kb-labs/studio-contracts';

export interface TabsOptions extends ContractOptions {}

export interface TabsProps extends BaseWidgetProps<unknown, TabsOptions> {
  /** Children widget IDs (from decl.children) */
  childrenIds?: string[];
  /** Render function for child widgets */
  renderChild?: (widgetId: string) => React.ReactNode;
}

export function Tabs({ options, childrenIds, renderChild }: TabsProps) {
  const {
    tabs = [],
    tabChildren = {},
    defaultActiveTab,
    position = 'top',
    variant = 'line',
    size = 'md',
    centered = false,
    animated = true,
    destroyInactive = false,
  } = options ?? {};

  const sizeMap: Record<string, 'small' | 'middle' | 'large'> = {
    sm: 'small',
    md: 'middle',
    lg: 'large',
  };

  const typeMap: Record<string, AntTabsProps['type']> = {
    line: 'line',
    card: 'card',
    button: 'editable-card',
  };

  const badgeStatusMap: Record<string, 'default' | 'success' | 'processing' | 'error' | 'warning'> = {
    default: 'default',
    primary: 'processing',
    danger: 'error',
  };

  const items = tabs.map((tab) => {
    const childIds = tabChildren[tab.id] || [];

    return {
      key: tab.id,
      label: (
        <span>
          {tab.icon && <span style={{ marginRight: 8 }}>{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <Badge
              count={tab.badge}
              status={badgeStatusMap[tab.badgeVariant || 'default']}
              style={{ marginLeft: 8 }}
            />
          )}
        </span>
      ),
      disabled: tab.disabled,
      closable: tab.closable,
      children: (
        <div>
          {childIds.map((childId) => (
            <React.Fragment key={childId}>
              {renderChild?.(childId)}
            </React.Fragment>
          ))}
        </div>
      ),
    };
  });

  return (
    <AntTabs
      items={items}
      defaultActiveKey={defaultActiveTab || tabs[0]?.id}
      tabPosition={position}
      type={typeMap[variant]}
      size={sizeMap[size]}
      centered={centered}
      animated={animated}
      destroyInactiveTabPane={destroyInactive}
    />
  );
}
