/**
 * @module @kb-labs/studio-app/components/widgets/navigation/Breadcrumb
 * Breadcrumb widget - navigation trail
 */

import * as React from 'react';
import { Breadcrumb as AntBreadcrumb, Dropdown } from 'antd';
import { HomeOutlined, EllipsisOutlined } from '@ant-design/icons';
import type { BaseWidgetProps } from '../types';
import type {
  BreadcrumbOptions as ContractOptions,
  BreadcrumbData,
  BreadcrumbItemDef,
} from '@kb-labs/studio-contracts';

export interface BreadcrumbOptions extends ContractOptions {}

export interface BreadcrumbProps extends BaseWidgetProps<BreadcrumbData, BreadcrumbOptions> {}

export function Breadcrumb({ data, options }: BreadcrumbProps) {
  const {
    items: optionItems,
    separator = '/',
    maxItems,
    itemsBeforeCollapse = 1,
    itemsAfterCollapse = 2,
    showHome = false,
    homeIcon,
  } = options ?? {};

  // Merge items from options and data
  const items: BreadcrumbItemDef[] = data?.items ?? optionItems ?? [];

  if (items.length === 0) {
    return null;
  }

  // Build breadcrumb items with optional collapsing
  const buildItems = () => {
    const result: React.ReactNode[] = [];

    // Add home if enabled
    if (showHome) {
      result.push(
        <AntBreadcrumb.Item key="home" href="/">
          {homeIcon ? <span>{homeIcon}</span> : <HomeOutlined />}
        </AntBreadcrumb.Item>
      );
    }

    // Check if we need to collapse
    if (maxItems && items.length > maxItems) {
      // Items before collapse
      const beforeItems = items.slice(0, itemsBeforeCollapse);
      const afterItems = items.slice(-itemsAfterCollapse);
      const middleItems = items.slice(itemsBeforeCollapse, -itemsAfterCollapse);

      // Add before items
      beforeItems.forEach((item, idx) => {
        result.push(renderItem(item, `before-${idx}`));
      });

      // Add collapsed dropdown
      if (middleItems.length > 0) {
        const menuItems = middleItems.map((item, idx) => ({
          key: `collapsed-${idx}`,
          label: item.href ? <a href={item.href}>{item.label}</a> : item.label,
        }));

        result.push(
          <AntBreadcrumb.Item key="collapsed">
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <span style={{ cursor: 'pointer' }}>
                <EllipsisOutlined />
              </span>
            </Dropdown>
          </AntBreadcrumb.Item>
        );
      }

      // Add after items
      afterItems.forEach((item, idx) => {
        result.push(renderItem(item, `after-${idx}`));
      });
    } else {
      // No collapsing needed
      items.forEach((item, idx) => {
        result.push(renderItem(item, `item-${idx}`));
      });
    }

    return result;
  };

  const renderItem = (item: BreadcrumbItemDef, key: string) => {
    const isLast = items.indexOf(item) === items.length - 1;

    return (
      <AntBreadcrumb.Item key={key} href={isLast ? undefined : item.href}>
        {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
        {item.label}
      </AntBreadcrumb.Item>
    );
  };

  return (
    <AntBreadcrumb separator={separator}>
      {buildItems()}
    </AntBreadcrumb>
  );
}
