import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  KBPageLayout,
  type NavigationItem,
  AVAILABLE_ICONS,
  getAvailableIconNames,
  KBStatusBar,
  StatusBarItem,
  StatusBarPresets,
} from '@kb-labs/studio-ui-react';
import type { StudioRegistry } from '@kb-labs/rest-api-contracts';
import { useAuth } from './providers/auth-provider';
import { useRegistry } from './providers/registry-provider';
import { CommandPaletteProvider, useCommandPalette } from './providers/command-palette-provider';
import { useNotifications } from '@kb-labs/studio-data-client';
import { useDataSources } from './providers/data-sources-provider';
import { HealthBanner } from './components/health-banner';
import { NotFoundPage } from './pages/not-found-page';
import { LoginPage } from './pages/login-page';
import { PluginPage } from './routes/plugin-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { WorkflowsListPage } from './modules/workflows/pages/workflows-list-page';
import { WorkflowRunPage } from './modules/workflows/pages/workflow-run-page';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { AIInsightsPage } from './modules/dashboard/pages/ai-insights-page';
import { DashboardLayout } from './modules/dashboard/layouts/dashboard-layout';
import { GalleryPage } from './pages/gallery-page';
import { StateBrokerPage } from './modules/observability/pages/state-broker-page';
import { DevKitPage } from './modules/observability/pages/devkit-page';
import { PrometheusMetricsPage } from './modules/observability/pages/prometheus-metrics-page';
import { SystemEventsPage } from './modules/observability/pages/system-events-page';
import { LogsPage } from './modules/observability/pages/logs-page';
import { LogDetailPage } from './modules/observability/pages/log-detail-page';
import { IncidentsPage } from './modules/observability/pages/incidents-page';
import { IncidentDetailPage } from './modules/observability/pages/incident-detail-page';
import { AnalyticsOverviewPage } from './modules/analytics/pages/analytics-overview-page';
import { AnalyticsEventsPage } from './modules/analytics/pages/analytics-events-page';
import { AnalyticsLLMPage } from './modules/analytics/pages/analytics-llm-page';
import { AnalyticsEmbeddingsPage } from './modules/analytics/pages/analytics-embeddings-page';
import { AnalyticsVectorStorePage } from './modules/analytics/pages/analytics-vectorstore-page';
import { AnalyticsCachePage } from './modules/analytics/pages/analytics-cache-page';
import { AnalyticsStoragePage } from './modules/analytics/pages/analytics-storage-page';
import { AgentsPage } from './modules/agents/pages/agents-page';
// TODO: TEMPORARY - Remove after commit plugin UI is polished
import { CommitPage } from './modules/commit/pages/commit-page';
import { ReleasePage } from './modules/release/pages/release-page';
import { QualityPage } from './modules/quality/pages/quality-page';
import { PluginsPage } from './modules/plugins/pages/plugins-page';
import { PluginDetailPage } from './modules/plugins/pages/plugin-detail-page';
import { WorkflowPage } from './modules/workflow/pages/workflow-page';
import { WidgetModalManager } from './components/widget-modal';
import { PageTransition } from './components/page-transition';
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
  if (!iconName) {return undefined;}

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
  const commandPalette = useCommandPalette();
  const sources = useDataSources();

  // Notifications hook
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
    // Clear user role
    localStorage.removeItem('studio-user-role');
    // Redirect to login
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
        children: [
          {
            key: 'dashboard-overview',
            label: 'Overview',
            path: '/',
            icon: renderPluginIcon('DashboardOutlined'),
          },
          {
            key: 'dashboard-insights',
            label: 'AI Insights',
            path: '/insights',
            icon: renderPluginIcon('RobotOutlined'),
          },
        ],
      },
      {
        key: 'workflow',
        label: 'Workflow',
        icon: renderPluginIcon('ThunderboltOutlined'),
        path: '/workflow',
      },
      {
        key: 'plugins',
        label: 'Plugins',
        icon: renderPluginIcon('AppstoreOutlined'),
        path: '/plugins',
      },
      {
        key: 'agents',
        label: 'Agents',
        icon: renderPluginIcon('RobotOutlined'),
        path: '/agents',
      },
      // TODO: TEMPORARY - Remove after commit plugin UI is polished
      {
        key: 'commit',
        label: 'Commit',
        icon: renderPluginIcon('GitlabOutlined'),
        path: '/commit',
      },
      {
        key: 'quality',
        label: 'Quality',
        icon: renderPluginIcon('CheckCircleOutlined'),
        path: '/quality',
      },
      {
        key: 'release',
        label: 'Release',
        icon: renderPluginIcon('RocketOutlined'),
        children: [
          {
            key: 'release-overview',
            label: 'Overview',
            path: '/release',
            icon: renderPluginIcon('DashboardOutlined'),
          },
          {
            key: 'release-history',
            label: 'History',
            path: '/release/history',
            icon: renderPluginIcon('HistoryOutlined'),
          },
        ],
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
          {
            key: 'logs',
            label: 'Live Logs',
            path: '/observability/logs',
            icon: renderPluginIcon('FileTextOutlined'),
          },
          {
            key: 'incidents',
            label: 'Incidents',
            path: '/observability/incidents',
            icon: renderPluginIcon('FireOutlined'),
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
    <>
      <KBPageLayout
        headerProps={{
          LinkComponent: Link as any,
          onLogout: handleLogout,
          userName: auth.role,
          onSearchClick: () => commandPalette.open(),
          // Notifications
          notifications,
          unreadNotificationsCount: unreadCount,
          onMarkNotificationAsRead: markAsRead,
          onMarkAllNotificationsAsRead: markAllAsRead,
          onClearAllNotifications: clearAll,
          onClearNotification: clearNotification,
          onNotificationClick: (notification) => {
            // Navigate to log detail page
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

function Layout() {
  return (
    <CommandPaletteProvider>
      <LayoutContent />
    </CommandPaletteProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
      {
        path: '/insights',
        element: <AIInsightsPage />,
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
        path: '/settings/:tab',
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
        path: '/workflow',
        element: <WorkflowPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflow/:tab',
        element: <WorkflowPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/plugins',
        element: <PluginsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/plugins/:pluginId',
        element: <PluginDetailPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/agents',
        element: <AgentsPage />,
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
      {
        path: '/observability/logs',
        element: <LogsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/observability/logs/:id',
        element: <LogDetailPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/observability/incidents',
        element: <IncidentsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/observability/incidents/:id',
        element: <IncidentDetailPage />,
        errorElement: <ErrorBoundary />,
      },
      // TODO: TEMPORARY - Remove after commit plugin UI is polished
      {
        path: '/commit',
        element: <CommitPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/commit/:tab',
        element: <CommitPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/quality',
        element: <QualityPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/quality/:tab',
        element: <QualityPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/release',
        element: <ReleasePage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/release/history',
        element: <ReleasePage view="history" />,
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

