import * as React from 'react';
import { Layout as AntLayout } from 'antd';
import { KBHeader, type KBHeaderProps } from './kb-header';
import { KBSidebar, type KBSidebarProps, type NavigationItem } from './kb-sidebar';
import { KBContent, type KBContentProps } from './kb-content';

export interface KBPageLayoutProps {
  headerProps?: KBHeaderProps;
  sidebarProps: Omit<KBSidebarProps, 'collapsed' | 'onCollapse'>;
  contentProps?: KBContentProps;
  sidebarCollapsed?: boolean;
  onSidebarCollapse?: (collapsed: boolean) => void;
  children?: React.ReactNode;
}

export function KBPageLayout({
  headerProps,
  sidebarProps,
  contentProps,
  sidebarCollapsed,
  onSidebarCollapse,
  children,
}: KBPageLayoutProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false);

  const collapsed = sidebarCollapsed !== undefined ? sidebarCollapsed : internalCollapsed;
  const setCollapsed = React.useCallback(
    (newCollapsed: boolean) => {
      if (sidebarCollapsed === undefined) {
        setInternalCollapsed(newCollapsed);
      }
      onSidebarCollapse?.(newCollapsed);
    },
    [sidebarCollapsed, onSidebarCollapse]
  );

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <KBHeader {...headerProps} />
      <AntLayout style={{ marginTop: 64 }}>
        <KBSidebar {...sidebarProps} collapsed={collapsed} onCollapse={setCollapsed} />
        <AntLayout
          style={{
            marginLeft: collapsed ? sidebarProps.collapsedWidth || 80 : sidebarProps.width || 200,
            transition: 'margin-left 0.2s',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <KBContent {...contentProps}>{children}</KBContent>
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
}

export type { KBHeaderProps, KBSidebarProps, KBContentProps, NavigationItem };

