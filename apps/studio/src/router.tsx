import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  KBPageLayout,
  type NavigationItem,
  AVAILABLE_ICONS,
  getAvailableIconNames,
  KBQuickSearch,
  type SearchableItem,
  KBStatusBar,
  StatusBarItem,
  StatusBarPresets,
} from '@kb-labs/studio-ui-react';
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
import { PrometheusMetricsPage } from './modules/observability/pages/prometheus-metrics-page';
import { SystemEventsPage } from './modules/observability/pages/system-events-page';
import { AnalyticsOverviewPage } from './modules/analytics/pages/analytics-overview-page';
import { AnalyticsEventsPage } from './modules/analytics/pages/analytics-events-page';
import { AnalyticsLLMPage } from './modules/analytics/pages/analytics-llm-page';
import { AnalyticsEmbeddingsPage } from './modules/analytics/pages/analytics-embeddings-page';
import { AnalyticsVectorStorePage } from './modules/analytics/pages/analytics-vectorstore-page';
import { AnalyticsCachePage } from './modules/analytics/pages/analytics-cache-page';
import { AnalyticsStoragePage } from './modules/analytics/pages/analytics-storage-page';
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
  const [searchOpen, setSearchOpen] = React.useState(false);

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
        key: 'analytics',
        label: 'Analytics',
        icon: renderPluginIcon('BarChartOutlined'),
        children: [
          {
            key: 'analytics-overview',
            label: 'Overview',
            path: '/analytics/overview',
            icon: renderPluginIcon('DashboardOutlined'),
          },
          {
            key: 'analytics-events',
            label: 'Events',
            path: '/analytics/events',
            icon: renderPluginIcon('ThunderboltOutlined'),
          },
          {
            key: 'analytics-adapters',
            label: 'Adapters',
            icon: renderPluginIcon('ApiOutlined'),
            children: [
              {
                key: 'analytics-llm',
                label: 'LLM Usage',
                path: '/analytics/llm',
                icon: renderPluginIcon('RobotOutlined'),
              },
              {
                key: 'analytics-embeddings',
                label: 'Embeddings Usage',
                path: '/analytics/embeddings',
                icon: renderPluginIcon('FileTextOutlined'),
              },
              {
                key: 'analytics-vectorstore',
                label: 'VectorStore Usage',
                path: '/analytics/vectorstore',
                icon: renderPluginIcon('DatabaseOutlined'),
              },
              {
                key: 'analytics-cache',
                label: 'Cache Usage',
                path: '/analytics/cache',
                icon: renderPluginIcon('ThunderboltOutlined'),
              },
              {
                key: 'analytics-storage',
                label: 'Storage Usage',
                path: '/analytics/storage',
                icon: renderPluginIcon('SaveOutlined'),
              },
            ],
          },
        ],
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
          {
            key: 'prometheus-metrics',
            label: 'Prometheus Metrics',
            path: '/observability/prometheus-metrics',
            icon: renderPluginIcon('ApiOutlined'),
          },
          {
            key: 'system-events',
            label: 'System Events',
            path: '/observability/system-events',
            icon: renderPluginIcon('ThunderboltOutlined'),
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

  // Build searchable items from navigation
  const searchableItems = React.useMemo<SearchableItem[]>(() => {
    const items: SearchableItem[] = [];

    // Add main pages
    items.push(
      {
        id: 'page-dashboard',
        title: 'Dashboard',
        description: 'Main dashboard with widgets',
        category: 'page',
        path: '/',
      },
      {
        id: 'page-workflows',
        title: 'Workflows',
        description: 'View and manage workflows',
        category: 'page',
        path: '/workflows',
      },
      {
        id: 'page-settings',
        title: 'Settings',
        description: 'Application settings',
        category: 'page',
        path: '/settings',
      }
    );

    // Add Analytics pages
    items.push(
      {
        id: 'page-analytics-overview',
        title: 'Analytics Overview',
        description: 'Analytics dashboard and insights',
        category: 'page',
        path: '/analytics/overview',
      },
      {
        id: 'page-analytics-events',
        title: 'Analytics Events',
        description: 'Event tracking and analytics',
        category: 'page',
        path: '/analytics/events',
      },
      {
        id: 'page-analytics-llm',
        title: 'LLM Usage Analytics',
        description: 'LLM adapter usage metrics',
        category: 'page',
        path: '/analytics/llm',
      },
      {
        id: 'page-analytics-embeddings',
        title: 'Embeddings Analytics',
        description: 'Embeddings adapter usage metrics',
        category: 'page',
        path: '/analytics/embeddings',
      },
      {
        id: 'page-analytics-vectorstore',
        title: 'VectorStore Analytics',
        description: 'VectorStore adapter usage metrics',
        category: 'page',
        path: '/analytics/vectorstore',
      },
      {
        id: 'page-analytics-cache',
        title: 'Cache Analytics',
        description: 'Cache adapter usage metrics',
        category: 'page',
        path: '/analytics/cache',
      },
      {
        id: 'page-analytics-storage',
        title: 'Storage Analytics',
        description: 'Storage adapter usage metrics',
        category: 'page',
        path: '/analytics/storage',
      }
    );

    // Add Observability pages
    items.push(
      {
        id: 'page-state-broker',
        title: 'State Broker',
        description: 'State management and caching',
        category: 'page',
        path: '/observability/state-broker',
      },
      {
        id: 'page-devkit',
        title: 'DevKit Health',
        description: 'Development tools health check',
        category: 'page',
        path: '/observability/devkit',
      },
      {
        id: 'page-prometheus',
        title: 'Prometheus Metrics',
        description: 'System metrics and monitoring',
        category: 'page',
        path: '/observability/prometheus-metrics',
      },
      {
        id: 'page-system-events',
        title: 'System Events',
        description: 'System event logs',
        category: 'page',
        path: '/observability/system-events',
      }
    );

    // Add plugin widgets
    if (hasData && registry.widgets) {
      for (const widget of registry.widgets) {
        items.push({
          id: `widget-${widget.id}`,
          title: widget.displayName,
          description: widget.description || `Widget from ${widget.pluginId}`,
          category: 'widget',
          path: `/plugins/${widget.pluginId}/${widget.widgetName}`,
        });
      }
    }

    return items;
  }, [hasData, registry.widgets]);

  // Handle Cmd+K / Ctrl+K hotkey for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <KBPageLayout
        headerProps={{
          LinkComponent: Link as any,
          onLogout: () => {
            // TODO: Implement logout
            logger.info('Logout initiated');
          },
          userName: auth.role,
          systemHealth: health
            ? {
                status: health.status as 'healthy' | 'degraded' | 'down' | 'unknown',
                ready: health.ready,
                reason: health.reason,
                pluginsMounted: health.pluginsMounted,
                pluginsFailed: health.pluginsFailed,
                registryRev: registryMeta.rev,
                registryGeneratedAt: registryMeta.generatedAt,
                registryStale: registryMeta.stale,
                registryPartial: registryMeta.partial,
                redisEnabled: health.redisEnabled,
                redisHealthy: health.redisHealthy,
              }
            : undefined,
          systemHealthLoading: loading && !hasData,
          onSearchClick: () => setSearchOpen(true),
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
        <Outlet />
        <WidgetModalManager />
      </KBPageLayout>

      <KBQuickSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        items={searchableItems}
        onNavigate={(path) => {
          navigate(path);
          setSearchOpen(false);
        }}
      />
    </>
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
        path: '/analytics/overview',
        element: <AnalyticsOverviewPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/analytics/events',
        element: <AnalyticsEventsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/analytics/llm',
        element: <AnalyticsLLMPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/analytics/embeddings',
        element: <AnalyticsEmbeddingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/analytics/vectorstore',
        element: <AnalyticsVectorStorePage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/analytics/cache',
        element: <AnalyticsCachePage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/analytics/storage',
        element: <AnalyticsStoragePage />,
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
      {
        path: '/observability/prometheus-metrics',
        element: <PrometheusMetricsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/observability/system-events',
        element: <SystemEventsPage />,
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

