import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './providers/auth-provider';
import { useRegistryV2 } from './providers/registry-v2-provider';
import { CommandPaletteProvider, useCommandPalette } from './providers/command-palette-provider';
import { useNotifications } from '@kb-labs/studio-data-client';
import { useDataSources } from './providers/data-sources-provider';
import { HealthBanner } from './components/health-banner';
import { NotFoundPage } from './pages/not-found-page';
import { LoginPage } from './pages/login-page';
import { PluginPageV2 } from './routes/plugin-page-v2';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { WorkflowsDashboardPage } from './modules/workflows/pages/workflows-dashboard-page';
import { WorkflowsRunsPage } from './modules/workflows/pages/workflows-runs-page';
import { WorkflowRunPage } from './modules/workflows/pages/workflow-run-page';
import { WorkflowsDefinitionsPage } from './modules/workflows/pages/workflows-definitions-page';
import { WorkflowDefinitionPage } from './modules/workflows/pages/workflow-definition-page';
import { WorkflowsJobsPage } from './modules/workflows/pages/workflows-jobs-page';
import { WorkflowsCronsPage } from './modules/workflows/pages/workflows-crons-page';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { AIInsightsPage } from './modules/dashboard/pages/ai-insights-page';
import { DashboardLayout } from './modules/dashboard/layouts/dashboard-layout';
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
import { ReleasePage } from './modules/release/pages/release-page';
import { QualityPage } from './modules/quality/pages/quality-page';
import { QADashboardPage } from './modules/qa/pages/qa-page';
import { PluginsPage } from './modules/plugins/pages/plugins-page';
import { PluginDetailPage } from './modules/plugins/pages/plugin-detail-page';
// Workflow pages - unified module
import { PageTransition } from './components/page-transition';
import { createStudioLogger } from './utils/logger';
import { ErrorBoundary } from './components/error-boundary';
import { useSettings } from './providers/settings-provider';
import { NavigationItemsProvider } from './providers/navigation-items-provider';
import { applyNavigationCategories } from './utils/apply-navigation-categories';
import { AVAILABLE_ICONS, KBPageLayout, KBStatusBar, type NavigationItem, StatusBarItem, StatusBarPresets, getAvailableIconNames } from '@/components/ui';

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
  const { registry, loading, error } = useRegistryV2();
  const commandPalette = useCommandPalette();
  const sources = useDataSources();
  const { settings } = useSettings();

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
    localStorage.removeItem('studio-user-role');
    navigate('/login');
  }, [logger, navigate]);

  const hasData = registry.plugins.length > 0;

  // Build plugin nav from V2 registry menus
  const pluginNavModel = React.useMemo<PluginNavModel[]>(() => {
    if (!hasData) return [];
    return buildPluginNavModel(registry);
  }, [registry, hasData]);


  // Build flat navigation items (before category grouping)
  const flatNavigationItems = React.useMemo<NavigationItem[]>(() => {
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
        key: 'workflows',
        label: 'Workflows',
        icon: renderPluginIcon('ThunderboltOutlined'),
        path: '/workflows',
        children: [
          {
            key: 'workflows-dashboard',
            label: 'Dashboard',
            path: '/workflows',
            icon: renderPluginIcon('DashboardOutlined'),
          },
          {
            key: 'workflows-runs',
            label: 'Runs',
            path: '/workflows/runs',
            icon: renderPluginIcon('PlayCircleOutlined'),
          },
          {
            key: 'workflows-definitions',
            label: 'Definitions',
            path: '/workflows/definitions',
            icon: renderPluginIcon('AppstoreOutlined'),
          },
          {
            key: 'workflows-jobs',
            label: 'Jobs',
            path: '/workflows/jobs',
            icon: renderPluginIcon('UnorderedListOutlined'),
          },
          {
            key: 'workflows-crons',
            label: 'Crons',
            path: '/workflows/crons',
            icon: renderPluginIcon('ClockCircleOutlined'),
          },
        ],
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
      {
        key: 'quality',
        label: 'Quality',
        icon: renderPluginIcon('CheckCircleOutlined'),
        path: '/quality',
      },
      {
        key: 'qa',
        label: 'QA',
        icon: renderPluginIcon('SafetyOutlined'),
        path: '/qa',
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
      if (model.routes.length === 1) {
        // Single page plugin — flat nav item (no submenu)
        const route = model.routes[0]!;
        items.push({
          key: `plugin-${model.pluginId}`,
          label: model.displayName,
          icon: renderPluginIcon(model.icon),
          path: route.path,
        });
      } else if (model.routes.length > 1) {
        // Multi-page plugin — group with children
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

  // Available items for NavigationSettings UI (top-level items except settings)
  const availableNavItems = React.useMemo(
    () =>
      flatNavigationItems
        .filter(item => item.key !== 'settings')
        .map(item => ({ key: item.key, label: item.label })),
    [flatNavigationItems],
  );

  // Apply user's category configuration
  const allNavigationItems = React.useMemo<NavigationItem[]>(
    () => applyNavigationCategories(flatNavigationItems, settings.navigation.categories),
    [flatNavigationItems, settings.navigation.categories],
  );

  React.useEffect(() => {
    if (error) {
      logger.error('Registry load failure in router', error);
    }
  }, [error, logger]);

  return (
    <NavigationItemsProvider items={availableNavItems}>
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
                  connected={hasData}
                  onClick={() => navigate('/observability/system-events')}
                />
                {hasData && (
                  <StatusBarItem
                    label={`${registry.plugins.length} plugin${registry.plugins.length === 1 ? '' : 's'}`}
                    tooltip={`${registry.plugins.length} plugins registered`}
                    status="success"
                    onClick={() => navigate('/settings')}
                    clickable
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
      </KBPageLayout>
    </NavigationItemsProvider>
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
        path: '/plugins/:pluginId/:widgetName',
        element: <PluginPageV2 />,
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
        element: <WorkflowsDashboardPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/runs',
        element: <WorkflowsRunsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/runs/:runId',
        element: <WorkflowRunPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/definitions',
        element: <WorkflowsDefinitionsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/definitions/:workflowId',
        element: <WorkflowDefinitionPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/jobs',
        element: <WorkflowsJobsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/workflows/crons',
        element: <WorkflowsCronsPage />,
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
        path: '/qa',
        element: <QADashboardPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: '/qa/:tab',
        element: <QADashboardPage />,
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
    // Catch-all for V2 plugin pages (Module Federation remotes).
    // If no static route matched, check the V2 registry.
    // PluginPageV2 resolves the route against registry or shows 404.
    path: '/p/*',
    element: <PluginPageV2 />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

function buildPluginNavModel(registry: import('@kb-labs/studio-federation').StudioRegistryV2): PluginNavModel[] {
  const groups = new Map<string, PluginNavModel>();

  for (const plugin of registry.plugins) {
    if (!plugin.menus || plugin.menus.length === 0) continue;

    const parentMenu = plugin.menus.find(m => !m.parentId);

    if (!groups.has(plugin.pluginId)) {
      groups.set(plugin.pluginId, {
        pluginId: plugin.pluginId,
        displayName: parentMenu?.label ?? plugin.displayName ?? plugin.pluginId,
        icon: parentMenu?.icon,
        routes: [],
      });
    }

    const group = groups.get(plugin.pluginId)!;

    for (const menu of plugin.menus) {
      // Resolve target: menu.target is a page ID, find the page's route
      const targetPage = plugin.pages.find(p => p.id === menu.target);
      const path = targetPage?.route ?? `/p/${menu.target}`;

      if (!menu.parentId) {
        // Top-level menu — set as the group's direct path
        group.routes.push({
          key: menu.id,
          label: menu.label,
          path,
          icon: menu.icon,
          order: menu.order,
        });
      } else {
        // Child menu — nested under parent
        group.routes.push({
          key: menu.id,
          label: menu.label,
          path,
          icon: menu.icon,
          order: menu.order,
        });
      }
    }
  }

  for (const group of groups.values()) {
    group.routes.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  return Array.from(groups.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

