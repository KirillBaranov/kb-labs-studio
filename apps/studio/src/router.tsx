import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { KBPageLayout, type NavigationItem } from '@kb-labs/studio-ui-react';
import { Home, Brain, Settings, GitBranch } from 'lucide-react';
import type { StudioRegistry } from '@kb-labs/plugin-adapter-studio';
import { useAuth } from './providers/auth-provider';
import { useRegistry } from './providers/registry-provider';
import { HealthBanner } from './components/health-banner';
import { NotFoundPage } from './pages/not-found-page';
import { PluginPage } from './routes/plugin-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { WorkflowsListPage } from './modules/workflows/pages/workflows-list-page';
import { WorkflowRunPage } from './modules/workflows/pages/workflow-run-page';
import { GalleryPage } from './pages/gallery-page';
import { WidgetModalManager } from './components/widget-modal';
import { createStudioLogger } from './utils/logger';

type PluginNavRoute = {
  key: string;
  label: string;
  path: string;
  order?: number;
};

type PluginNavModel = {
  pluginId: string;
  displayName: string;
  routes: PluginNavRoute[];
};

// Helper function to get icon for plugin
function getPluginIcon(pluginId: string): React.ReactElement {
  // Map plugin IDs to icons
  const iconMap: Record<string, React.ComponentType<any>> = {
    '@kb-labs/mind': Brain,
    // Add more mappings as needed
  };
  
  // Try to find icon by exact match or by prefix
  let IconComponent = iconMap[pluginId];
  
  if (!IconComponent) {
    // Try to match by prefix (e.g., '@kb-labs/mind' matches 'mind')
    const pluginName = pluginId.split('/').pop() || pluginId;
    if (pluginName === 'mind') {
      IconComponent = Brain;
    }
  }
  
  // Default icon if not found
  if (!IconComponent) {
    IconComponent = Settings; // Use Settings as default icon
  }
  
  return React.createElement(IconComponent, { size: 16 });
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
        icon: React.createElement(Home, { size: 16 }),
        path: '/',
      },
      {
        key: 'workflows',
        label: 'Workflows',
        icon: React.createElement(GitBranch, { size: 16 }),
        path: '/workflows',
      },
      {
        key: 'settings',
        label: 'Settings',
        icon: React.createElement(Settings, { size: 16 }),
        path: '/settings',
      },
    ];

    for (const model of pluginNavModel) {
      items.push({
        key: `plugin-${model.pluginId}`,
        label: model.displayName,
        icon: getPluginIcon(model.pluginId),
        children: model.routes.map(route => ({
          key: route.key,
          label: route.label,
          path: route.path,
        })),
      });
    }

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
    children: [
      {
        path: '/',
        element: <GalleryPage />,
      },
      {
        path: '/plugins/:pluginId/:widgetName',
        element: <PluginPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />, 
      },
      {
        path: '/workflows',
        element: <WorkflowsListPage />, 
      },
      {
        path: '/workflows/:runId',
        element: <WorkflowRunPage />, 
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

function buildPluginNavModel(registry: StudioRegistry): PluginNavModel[] {
  const groups = new Map<string, PluginNavModel>();

  for (const menuEntry of registry.menus) {
    const pluginId = menuEntry.plugin.id;
    if (!groups.has(pluginId)) {
      const plugin = registry.plugins.find(p => p.id === pluginId);
      groups.set(pluginId, {
        pluginId,
        displayName: plugin?.displayName || pluginId,
        routes: [],
      });
    }
    const group = groups.get(pluginId)!;
    group.routes.push({
      key: menuEntry.id,
      label: menuEntry.label,
      path: menuEntry.target,
      order: menuEntry.order,
    });
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
    if (left.pluginId !== right.pluginId || left.displayName !== right.displayName) {
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

