import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { KBPageLayout, type NavigationItem, AVAILABLE_ICONS, getAvailableIconNames } from '@kb-labs/studio-ui-react';
import type { StudioRegistry } from '@kb-labs/rest-api-contracts';
import { useAuth } from './providers/auth-provider';
import { useRegistry } from './providers/registry-provider';
import { HealthBanner } from './components/health-banner';
import { NotFoundPage } from './pages/not-found-page';
import { PluginPage } from './routes/plugin-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { WorkflowsListPage } from './modules/workflows/pages/workflows-list-page';
import { WorkflowRunPage } from './modules/workflows/pages/workflow-run-page';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { GalleryPage } from './pages/gallery-page';
import { StateBrokerPage } from './modules/observability/pages/state-broker-page';
import { DevKitPage } from './modules/observability/pages/devkit-page';
import { WidgetModalManager } from './components/widget-modal';
import { createStudioLogger } from './utils/logger';
import { ErrorBoundary } from './components/error-boundary';

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

// Helper function to render icon from available icons registry
function renderPluginIcon(iconName?: string): React.ReactElement | undefined {
  if (!iconName) return undefined;

  const IconComponent = AVAILABLE_ICONS[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not available in registry`);
    return undefined;
  }

  return React.createElement(IconComponent, { style: { fontSize: 16 } });
}

function LayoutContent() {
  const logger = React.useMemo(() => createStudioLogger('router'), []);

  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { registry, loading, error, retrying, hasData, refresh, registryMeta, health } = useRegistry();

  const [pluginNavModel, setPluginNavModel] = React.useState<PluginNavModel[]>([]);

  React.useEffect(() => {
    if (!hasData) {
      setPluginNavModel(prev => (prev.length > 0 ? [] : prev));
      return;
    }

    const nextModel = buildPluginNavModel(registry);
    setPluginNavModel(prev => (arePluginModelsEqual(prev, nextModel) ? prev : nextModel));
  }, [registry, hasData]);

  const sidebarSkeleton = loading && !hasData;
  const sidebarError = !!error && !hasData;
  const sidebarWarning = hasData && !sidebarError && !sidebarSkeleton && (
    registryMeta.partial ||
    registryMeta.stale ||
    (health?.pluginsFailed ?? 0) > 0
  );

  const allNavigationItems = React.useMemo<NavigationItem[]>(() => {
    const items: NavigationItem[] = [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: renderPluginIcon('DashboardOutlined'),
        path: '/',
      },
      {
        key: 'workflows',
        label: 'Workflows',
        icon: renderPluginIcon('BranchesOutlined'),
        path: '/workflows',
      },
      {
        key: 'observability',
        label: 'Observability',
        icon: renderPluginIcon('LineChartOutlined'),
        children: [
          {
            key: 'state-broker',
            label: 'State Broker',
            path: '/observability/state-broker',
            icon: renderPluginIcon('DatabaseOutlined'),
          },
          {
            key: 'devkit',
            label: 'DevKit Health',
            path: '/observability/devkit',
            icon: renderPluginIcon('CheckCircleOutlined'),
          },
        ],
      },
    ];

    // Add plugin navigation items
    for (const model of pluginNavModel) {
      items.push({
        key: `plugin-${model.pluginId}`,
        label: model.displayName,
        icon: renderPluginIcon(model.icon), // Use parent menu's icon
        children: model.routes.map(route => ({
          key: route.key,
          label: route.label,
          path: route.path,
          icon: renderPluginIcon(route.icon),
        })),
      });
    }

    // Add settings at the bottom
    items.push({
      key: 'settings',
      label: 'Settings',
      icon: renderPluginIcon('SettingOutlined'),
      path: '/settings',
    });

    return items;
  }, [pluginNavModel]);

  React.useEffect(() => {
    if (error) {
      logger.error('Registry load failure in router', error);
    }
  }, [error, logger]);

  return (
    <KBPageLayout
      headerProps={{
        LinkComponent: Link as any,
        onLogout: () => {
          // TODO: Implement logout
          logger.info('Logout initiated');
        },
        userName: auth.role,
      }}
      sidebarProps={{
        items: allNavigationItems,
        width: 200,
        collapsedWidth: 80,
        currentPath: location.pathname,
        onNavigate: (path) => navigate(path),
      }}
    >
      <HealthBanner />
      <Outlet />
      <WidgetModalManager />
    </KBPageLayout>
  );
}

function Layout() {
  return <LayoutContent />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <DashboardPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/gallery',
        element: <GalleryPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/plugins/:pluginId/:widgetName',
        element: <PluginPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows',
        element: <WorkflowsListPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/:runId',
        element: <WorkflowRunPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/observability/state-broker',
        element: <StateBrokerPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/observability/devkit',
        element: <DevKitPage />,
        errorElement: <ErrorBoundary />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

function buildPluginNavModel(registry: StudioRegistry & { menus?: any[] }): PluginNavModel[] {
  const groups = new Map<string, PluginNavModel>();

  // Use nested structure since menus don't have pluginId after flatten
  // Iterate through plugins to preserve plugin metadata
  for (const plugin of registry.plugins ?? []) {
    if (!plugin.menus || plugin.menus.length === 0) {
      continue;
    }

    const pluginId = plugin.pluginId;

    // Find parent menu (menu without parentId) to get display name and icon
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

    // Only add child menus (with parentId) to routes
    // Parent menus without parentId are represented by the plugin group itself
    for (const menuEntry of plugin.menus) {
      if (!menuEntry.parentId) {
        // This is a parent menu - skip it, the plugin group represents it
        continue;
      }

      group.routes.push({
        key: menuEntry.id,
        label: menuEntry.label,
        path: menuEntry.target,
        icon: menuEntry.icon, // Use icon from menu manifest
        order: menuEntry.order,
      });
    }
  }

  for (const group of groups.values()) {
    group.routes.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
        return a.order - b.order;
      }
      if (a.order !== undefined) {
        return -1;
      }
      if (b.order !== undefined) {
        return 1;
      }
      return a.label.localeCompare(b.label);
    });
  }

  return Array.from(groups.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function arePluginModelsEqual(a: PluginNavModel[], b: PluginNavModel[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    const left = a[i];
    const right = b[i];
    if (!left || !right) {
      return false;
    }
    if (left.pluginId !== right.pluginId || left.displayName !== right.displayName || left.icon !== right.icon) {
      return false;
    }
    if (left.routes.length !== right.routes.length) {
      return false;
    }
    for (let j = 0; j < left.routes.length; j++) {
      const lr = left.routes[j];
      const rr = right.routes[j];
      if (!lr || !rr) {
        return false;
      }
      if (lr.key !== rr.key || lr.label !== rr.label || lr.path !== rr.path || lr.order !== rr.order) {
        return false;
      }
    }
  }
  return true;
}

