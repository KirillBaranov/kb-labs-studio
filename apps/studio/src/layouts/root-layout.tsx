/**
 * @module @kb-labs/studio-app/layouts/root-layout
 * Root layout with sidebar navigation and header
 */

import * as React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  KBPageLayout,
  type NavigationItem,
  AVAILABLE_ICONS,
  KBStatusBar,
  StatusBarItem,
  StatusBarPresets,
} from '@kb-labs/studio-ui-react';
import type { StudioRegistry } from '@kb-labs/rest-api-contracts';
import { useAuth } from '../providers/auth-provider';
import { useRegistry } from '../providers/registry-provider';
import { CommandPaletteProvider, useCommandPalette } from '../providers/command-palette-provider';
import { useNotifications } from '@kb-labs/studio-data-client';
import { useDataSources } from '../providers/data-sources-provider';
import { HealthBanner } from '../components/health-banner';
import { WidgetModalManager } from '../components/widget-modal';
import { PageTransition } from '../components/page-transition';
import { createStudioLogger } from '../utils/logger';
import { renderIcon } from '../routes/helpers';

// Import navigation from all modules
import { dashboardNavigation } from '../modules/dashboard/routes';
import { workflowNavigation } from '../modules/workflow/routes';
import { pluginsNavigation } from '../modules/plugins/routes';
import { assistantNavigation } from '../modules/assistant/routes';
import { commitNavigation } from '../modules/commit/routes';
import { qualityNavigation } from '../modules/quality/routes';
import { releaseNavigation } from '../modules/release/routes';
import { analyticsNavigation } from '../modules/analytics/routes';
import { observabilityNavigation } from '../modules/observability/routes';
import { settingsNavigation } from '../modules/settings/routes';

type PluginNavRoute = {
  key: string;
  label: string;
  path: string;
  icon?: string;
  order?: number;
};

type PluginNavModel = {
  pluginId: string;
  displayName: string;
  icon?: string;
  routes: PluginNavRoute[];
};

function renderPluginIcon(iconName?: string): React.ReactElement | undefined {
  if (!iconName) {return undefined;}

  const IconComponent = AVAILABLE_ICONS[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not available in registry`);
    return undefined;
  }

  return React.createElement(IconComponent, { style: { fontSize: 16 } });
}

function buildPluginNavModel(registry: StudioRegistry & { menus?: any[] }): PluginNavModel[] {
  const groups = new Map<string, PluginNavModel>();

  for (const plugin of registry.plugins ?? []) {
    if (!plugin.menus || plugin.menus.length === 0) {
      continue;
    }

    const pluginId = plugin.pluginId;
    const parentMenu = plugin.menus.find(m => !m.parentId);

    if (!groups.has(pluginId)) {
      groups.set(pluginId, {
        pluginId,
        displayName: parentMenu?.label ?? plugin.displayName ?? pluginId,
        icon: parentMenu?.icon,
        routes: [],
      });
    }

    const group = groups.get(pluginId)!;

    for (const menuEntry of plugin.menus) {
      if (!menuEntry.parentId) {
        continue;
      }

      group.routes.push({
        key: menuEntry.id,
        label: menuEntry.label,
        path: menuEntry.target,
        icon: menuEntry.icon,
        order: menuEntry.order,
      });
    }
  }

  for (const group of groups.values()) {
    group.routes.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
        return a.order - b.order;
      }
      if (a.order !== undefined) {return -1;}
      if (b.order !== undefined) {return 1;}
      return a.label.localeCompare(b.label);
    });
  }

  return Array.from(groups.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function arePluginModelsEqual(a: PluginNavModel[], b: PluginNavModel[]): boolean {
  if (a.length !== b.length) {return false;}

  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (!left || !right) {return false;}
    if (left.pluginId !== right.pluginId || left.displayName !== right.displayName || left.icon !== right.icon) {
      return false;
    }
    if (left.routes.length !== right.routes.length) {return false;}

    for (let j = 0; j < left.routes.length; j++) {
      const lr = left.routes[j];
      const rr = right.routes[j];
      if (!lr || !rr) {return false;}
      if (lr.key !== rr.key || lr.label !== rr.label || lr.path !== rr.path || lr.order !== rr.order) {
        return false;
      }
    }
  }
  return true;
}

function LayoutContent() {
  const logger = React.useMemo(() => createStudioLogger('router'), []);

  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { registry, loading, error, hasData, registryMeta, health } = useRegistry();
  const commandPalette = useCommandPalette();
  const sources = useDataSources();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    clearNotification,
  } = useNotifications(sources.observability);

  const handleLogout = React.useCallback(() => {
    logger.info('User logout initiated');
    localStorage.removeItem('studio-user-role');
    navigate('/login');
  }, [logger, navigate]);

  const [pluginNavModel, setPluginNavModel] = React.useState<PluginNavModel[]>([]);

  React.useEffect(() => {
    if (!hasData) {
      setPluginNavModel(prev => (prev.length > 0 ? [] : prev));
      return;
    }

    const nextModel = buildPluginNavModel(registry);
    setPluginNavModel(prev => (arePluginModelsEqual(prev, nextModel) ? prev : nextModel));
  }, [registry, hasData]);

  const allNavigationItems = React.useMemo<NavigationItem[]>(() => {
    const items: NavigationItem[] = [
      dashboardNavigation,
      workflowNavigation,
      pluginsNavigation,
      assistantNavigation,
      commitNavigation,
      qualityNavigation,
      releaseNavigation,
      analyticsNavigation,
      observabilityNavigation,
    ];

    // Add plugin navigation items
    for (const model of pluginNavModel) {
      items.push({
        key: `plugin-${model.pluginId}`,
        label: model.displayName,
        icon: renderPluginIcon(model.icon),
        children: model.routes.map(route => ({
          key: route.key,
          label: route.label,
          path: route.path,
          icon: renderPluginIcon(route.icon),
        })),
      });
    }

    // Add settings at the bottom
    items.push(settingsNavigation);

    return items;
  }, [pluginNavModel]);

  React.useEffect(() => {
    if (error) {
      logger.error('Registry load failure in router', error);
    }
  }, [error, logger]);

  return (
    <>
      <KBPageLayout
        headerProps={{
          LinkComponent: Link as any,
          onLogout: handleLogout,
          userName: auth.role,
          onSearchClick: () => commandPalette.open(),
          notifications,
          unreadNotificationsCount: unreadCount,
          onMarkNotificationAsRead: markAsRead,
          onMarkAllNotificationsAsRead: markAllAsRead,
          onClearAllNotifications: clearAll,
          onClearNotification: clearNotification,
          onNotificationClick: (notification) => {
            navigate(`/observability/logs/${notification.id}`);
          },
        }}
        sidebarProps={{
          items: allNavigationItems,
          width: 240,
          collapsedWidth: 80,
          currentPath: location.pathname,
          onNavigate: (path) => navigate(path),
        }}
        statusBar={
          <KBStatusBar
            leftItems={
              <>
                <StatusBarPresets.ApiConnection
                  connected={health?.ready ?? false}
                  onClick={() => navigate('/observability/system-events')}
                />
                {health?.pluginsMounted !== undefined && (
                  <StatusBarItem
                    label={`${health.pluginsMounted} plugin${health.pluginsMounted === 1 ? '' : 's'}`}
                    tooltip={`${health.pluginsMounted} plugins mounted${health.pluginsFailed ? `, ${health.pluginsFailed} failed` : ''}`}
                    status={health.pluginsFailed ? 'warning' : 'success'}
                    onClick={() => navigate('/settings')}
                    clickable
                  />
                )}
                {registryMeta.rev !== null && (
                  <StatusBarItem
                    label={`Registry #${registryMeta.rev}`}
                    tooltip={`Registry revision ${registryMeta.rev}${registryMeta.stale ? ' (stale)' : ''}${registryMeta.partial ? ' (partial)' : ''}`}
                    status={registryMeta.stale || registryMeta.partial ? 'warning' : undefined}
                  />
                )}
              </>
            }
            rightItems={
              <>
                <StatusBarPresets.User email={auth.role} onClick={() => navigate('/settings')} />
                <StatusBarPresets.Version version="0.1.0" />
                <StatusBarPresets.Help onClick={() => window.open('https://github.com/kb-labs', '_blank')} />
              </>
            }
          />
        }
      >
        <HealthBanner />
        <PageTransition>
          <div style={{ paddingBottom: '20px' }}>
            <Outlet />
          </div>
        </PageTransition>
        <WidgetModalManager />
      </KBPageLayout>
    </>
  );
}

export function RootLayout() {
  return (
    <CommandPaletteProvider>
      <LayoutContent />
    </CommandPaletteProvider>
  );
}
