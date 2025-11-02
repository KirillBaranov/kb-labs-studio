import * as React from 'react';
import { Layout, Menu, Button } from 'antd';
import type { MenuProps } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Sider: AntSider } = Layout;

export interface NavigationItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  children?: NavigationItem[];
}

export interface KBSidebarProps {
  items: NavigationItem[];
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  width?: number;
  collapsedWidth?: number;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function KBSidebar({
  items,
  collapsed: controlledCollapsed,
  onCollapse,
  width = 200,
  collapsedWidth = 80,
  currentPath,
  onNavigate,
}: KBSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setCollapsed = React.useCallback(
    (newCollapsed: boolean) => {
      if (controlledCollapsed === undefined) {
        setInternalCollapsed(newCollapsed);
      }
      onCollapse?.(newCollapsed);
    },
    [controlledCollapsed, onCollapse]
  );

  // Convert navigation items to Ant Design menu items
  const menuItems: MenuProps['items'] = React.useMemo(() => {
    const convertItems = (navItems: NavigationItem[]): MenuProps['items'] => {
      return navItems.map((item) => {
        const menuItem: any = {
          key: item.key || item.path,
          icon: item.icon,
          label: item.label,
        };

        if (item.children && item.children.length > 0) {
          menuItem.children = convertItems(item.children);
          // Parent items should still navigate when clicked
          menuItem.onClick = () => onNavigate?.(item.path);
        } else {
          menuItem.onClick = () => onNavigate?.(item.path);
        }

        return menuItem;
      });
    };

    return convertItems(items);
  }, [items, onNavigate]);

  // Get selected keys based on current path
  const selectedKeys = React.useMemo(() => {
    if (!currentPath) return [];
    
    const findKeys = (path: string, navItems: NavigationItem[]): string[] => {
      for (const item of navItems) {
        if (item.path === path) {
          return [item.key || item.path];
        }
        if (item.children) {
          const childKeys = findKeys(path, item.children);
          if (childKeys.length > 0) {
            return [item.key || item.path, ...childKeys];
          }
        }
      }
      return [];
    };

    return findKeys(currentPath, items);
  }, [currentPath, items]);

  const openKeys = React.useMemo(() => {
    if (!currentPath) return [];
    
    const findOpenKeys = (path: string, navItems: NavigationItem[]): string[] => {
      for (const item of navItems) {
        if (item.children) {
          const childKeys = findOpenKeys(path, item.children);
          if (childKeys.length > 0) {
            return [item.key || item.path, ...childKeys];
          }
        }
      }
      return [];
    };

    return findOpenKeys(currentPath, items);
  }, [currentPath, items]);

  return (
    <AntSider
      collapsible
      collapsed={collapsed}
      width={width}
      collapsedWidth={collapsedWidth}
      trigger={null}
      style={{
        overflow: 'auto',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        left: 0,
        top: 64,
        bottom: 0,
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-primary)',
      }}
      theme="light" // Prevent Ant Design from applying dark theme styles
    >
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-primary)' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: 16,
            width: '100%',
            height: 32,
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        style={{ height: '100%', borderRight: 0 }}
      />
    </AntSider>
  );
}

