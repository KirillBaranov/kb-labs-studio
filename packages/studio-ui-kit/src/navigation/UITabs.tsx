/**
 * UITabs component - Tabbed navigation
 *
 * Wraps Ant Design Tabs with simplified API.
 * NO hardcoded colors, uses Ant Design theme.
 */

import * as React from 'react';
import { Tabs as AntTabs } from 'antd';

export interface UITabItem {
  /** Tab key */
  key: string;
  /** Tab label */
  label: string;
  /** Tab icon */
  icon?: React.ReactNode;
  /** Tab content */
  children: React.ReactNode;
  /** Disabled tab */
  disabled?: boolean;
  /** Closable tab */
  closable?: boolean;
}

export interface UITabsProps {
  /** Tab items */
  items: UITabItem[];
  /** Active tab key */
  activeKey?: string;
  /** Default active tab key */
  defaultActiveKey?: string;
  /** Tab position */
  tabPosition?: 'top' | 'right' | 'bottom' | 'left';
  /** Tab type */
  type?: 'line' | 'card';
  /** Tab size */
  size?: 'small' | 'middle' | 'large';
  /** Change handler */
  onChange?: (activeKey: string) => void;
  /** Tab edit handler (for closable tabs) */
  onEdit?: (targetKey: string, action: 'add' | 'remove') => void;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * UITabs - Tabbed navigation
 *
 * @example
 * ```tsx
 * <UITabs
 *   items={[
 *     {
 *       key: 'overview',
 *       label: 'Overview',
 *       children: <OverviewContent />,
 *     },
 *     {
 *       key: 'details',
 *       label: 'Details',
 *       icon: <InfoIcon />,
 *       children: <DetailsContent />,
 *     },
 *   ]}
 *   onChange={(key) => console.log('Active tab:', key)}
 * />
 *
 * <UITabs
 *   type="card"
 *   items={cardItems}
 *   onEdit={(key, action) => handleEdit(key, action)}
 * />
 * ```
 */
export function UITabs({
  items,
  activeKey,
  defaultActiveKey,
  tabPosition = 'top',
  type = 'line',
  size = 'middle',
  onChange,
  onEdit,
  className,
  style,
}: UITabsProps) {
  const tabItems = items.map((item) => ({
    key: item.key,
    label: item.icon ? (
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {item.icon}
        <span>{item.label}</span>
      </span>
    ) : item.label,
    children: item.children,
    disabled: item.disabled,
    closable: item.closable,
  }));

  const handleEdit = onEdit
    ? (targetKey: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
        const key = typeof targetKey === 'string' ? targetKey : '';
        onEdit(key, action);
      }
    : undefined;

  return (
    <AntTabs
      items={tabItems}
      activeKey={activeKey}
      defaultActiveKey={defaultActiveKey}
      tabPosition={tabPosition}
      type={type}
      size={size}
      onChange={onChange}
      onEdit={handleEdit}
      className={className}
      style={style}
    />
  );
}
