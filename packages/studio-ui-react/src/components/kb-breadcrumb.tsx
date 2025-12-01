import * as React from 'react';
import { Breadcrumb } from 'antd';
import type { BreadcrumbProps } from 'antd';

export interface BreadcrumbItem {
  title: string;
  path?: string;
}

export interface KBBreadcrumbProps extends Omit<BreadcrumbProps, 'items'> {
  items?: BreadcrumbItem[];
  LinkComponent?: React.ComponentType<{ to: string; children: React.ReactNode }>;
  getCurrentPath?: () => string;
}

export function KBBreadcrumb({
  items: providedItems,
  LinkComponent,
  getCurrentPath,
  ...props
}: KBBreadcrumbProps) {
  const items = React.useMemo(() => {
    if (!providedItems) {
      return [];
    }

    return providedItems.map((item) => {
      if (!item.path) {
        return { title: item.title };
      }

      if (LinkComponent) {
        const Link = LinkComponent;
        return {
          title: <Link to={item.path}>{item.title}</Link>,
        };
      }

      return {
        title: (
          <a href={item.path} style={{ color: 'inherit', textDecoration: 'none' }}>
            {item.title}
          </a>
        ),
      };
    });
  }, [providedItems, LinkComponent]);

  if (items.length === 0) {
    return null;
  }

  return <Breadcrumb items={items} {...props} />;
}

