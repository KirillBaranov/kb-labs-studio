/**
 * @module @kb-labs/studio-app/components/widgets/navigation/Menu
 * Menu widget - navigation menu / dropdown
 */

import * as React from 'react';
import { Menu as AntMenu, Dropdown, Badge } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd';
import type { BaseWidgetProps } from '../types';
import type {
  MenuOptions as ContractOptions,
  MenuData,
  MenuItemDef,
} from '@kb-labs/studio-contracts';

export interface MenuOptions extends ContractOptions {}

export interface MenuProps extends BaseWidgetProps<MenuData, MenuOptions> {
  /** Callback when menu item is clicked */
  onItemClick?: (itemId: string, action?: string) => void;
  /** Trigger element for dropdown mode */
  trigger?: React.ReactNode;
}

export function Menu({ data, options, onItemClick, trigger }: MenuProps) {
  const {
    items: optionItems,
    mode = 'vertical',
    placement = 'bottomLeft',
    collapsed = false,
    selectedId: optionSelectedId,
    openIds: optionOpenIds,
    theme = 'light',
    showIcons = true,
    indent = 24,
  } = options ?? {};

  // Merge from data and options
  const items: MenuItemDef[] = data?.items ?? optionItems ?? [];
  const selectedId = data?.selectedId ?? optionSelectedId;
  const openIds = data?.openIds ?? optionOpenIds ?? [];

  const [openKeys, setOpenKeys] = React.useState<string[]>(openIds);

  if (items.length === 0) {
    return null;
  }

  const badgeVariantMap: Record<string, 'default' | 'processing' | 'error'> = {
    default: 'default',
    primary: 'processing',
    danger: 'error',
  };

  const buildMenuItems = (menuItems: MenuItemDef[]): AntMenuProps['items'] => {
    return menuItems.map((item) => {
      // Divider
      if (item.divider) {
        return { type: 'divider' as const, key: `divider-${item.id}` };
      }

      // Build label with optional badge and shortcut
      const label = (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>
            {showIcons && item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
            {item.label}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.badge && (
              <Badge
                count={item.badge}
                status={badgeVariantMap[item.badgeVariant || 'default']}
                size="small"
              />
            )}
            {item.shortcut && (
              <span style={{ opacity: 0.5, fontSize: 12 }}>{item.shortcut}</span>
            )}
          </span>
        </span>
      );

      // Submenu with children
      if (item.children && item.children.length > 0) {
        return {
          key: item.id,
          label,
          disabled: item.disabled,
          danger: item.danger,
          children: buildMenuItems(item.children),
        };
      }

      // Regular item
      return {
        key: item.id,
        label: item.href ? <a href={item.href}>{label}</a> : label,
        disabled: item.disabled,
        danger: item.danger,
      };
    });
  };

  const handleClick: AntMenuProps['onClick'] = (info) => {
    const item = findItem(items, info.key);
    if (item) {
      onItemClick?.(item.id, item.action);
    }
  };

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  const findItem = (menuItems: MenuItemDef[], id: string): MenuItemDef | undefined => {
    for (const item of menuItems) {
      if (item.id === id) {return item;}
      if (item.children) {
        const found = findItem(item.children, id);
        if (found) {return found;}
      }
    }
    return undefined;
  };

  const menuItems = buildMenuItems(items);

  const menu = (
    <AntMenu
      mode={mode}
      theme={theme}
      items={menuItems}
      selectedKeys={selectedId ? [selectedId] : []}
      openKeys={openKeys}
      onClick={handleClick}
      onOpenChange={handleOpenChange}
      inlineCollapsed={collapsed}
      inlineIndent={indent}
    />
  );

  // If trigger is provided, render as dropdown
  if (trigger) {
    return (
      <Dropdown
        menu={{ items: menuItems, onClick: handleClick }}
        trigger={['click']}
        placement={placement}
      >
        {trigger}
      </Dropdown>
    );
  }

  return menu;
}
