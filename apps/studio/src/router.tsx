import * as React from 'react';
import { createBrowserRouter, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { KBPageLayout, type NavigationItem } from '@kb-labs/ui-react';
import { Home, ShieldCheck, Rocket, Link2, Brain, BarChart3, Settings } from 'lucide-react';
import { useAuth } from './providers/auth-provider';
import { HealthBanner } from './components/health-banner';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { AuditListPage } from './modules/audit/pages/audit-list-page';
import { ReleasePage } from './modules/release/pages/release-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { DevlinkPage } from './modules/devlink/pages/devlink-page';
import { MindPage } from './modules/mind/pages/mind-page';
import { AnalyticsPage } from './modules/analytics/pages/analytics-page';
import { NotFoundPage } from './pages/not-found-page';

const navigationItems: NavigationItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: React.createElement(Home, { size: 16 }),
    path: '/',
    children: [
      { key: 'overview', label: 'Overview', path: '/dashboard/overview' },
      { key: 'metrics', label: 'Metrics', path: '/dashboard/metrics' },
      { key: 'activity', label: 'Recent Activity', path: '/dashboard/activity' },
    ],
  },
  {
    key: 'audit',
    label: 'Audit',
    icon: React.createElement(ShieldCheck, { size: 16 }),
    path: '/audit',
    children: [
      { key: 'summary', label: 'Summary', path: '/audit/summary' },
      { key: 'packages', label: 'Packages', path: '/audit/packages' },
      { key: 'reports', label: 'Reports', path: '/audit/reports' },
    ],
  },
  {
    key: 'release',
    label: 'Release',
    icon: React.createElement(Rocket, { size: 16 }),
    path: '/release',
    children: [
      { key: 'preview', label: 'Preview', path: '/release/preview' },
      { key: 'history', label: 'History', path: '/release/history' },
      { key: 'settings', label: 'Settings', path: '/release/settings' },
    ],
  },
  {
    key: 'devlink',
    label: 'DevLink',
    icon: React.createElement(Link2, { size: 16 }),
    path: '/devlink',
    children: [
      { key: 'graph', label: 'Graph', path: '/devlink/graph' },
      { key: 'cycles', label: 'Cycles', path: '/devlink/cycles' },
      { key: 'dependencies', label: 'Dependencies', path: '/devlink/dependencies' },
    ],
  },
  {
    key: 'mind',
    label: 'Mind',
    icon: React.createElement(Brain, { size: 16 }),
    path: '/mind',
    children: [
      { key: 'verification', label: 'Verification', path: '/mind/verification' },
      { key: 'freshness', label: 'Freshness', path: '/mind/freshness' },
      { key: 'reports', label: 'Reports', path: '/mind/reports' },
    ],
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: React.createElement(BarChart3, { size: 16 }),
    path: '/analytics',
    children: [
      { key: 'events', label: 'Events', path: '/analytics/events' },
      { key: 'performance', label: 'Performance', path: '/analytics/performance' },
      { key: 'usage', label: 'Usage', path: '/analytics/usage' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: React.createElement(Settings, { size: 16 }),
    path: '/settings',
    children: [
      { key: 'general', label: 'General', path: '/settings/general' },
      { key: 'data-sources', label: 'Data Sources', path: '/settings/data-sources' },
      { key: 'preferences', label: 'Preferences', path: '/settings/preferences' },
    ],
  },
];

function LayoutContent() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <KBPageLayout
      headerProps={{
        LinkComponent: Link,
        onLogout: () => {
          // TODO: Implement logout
          console.log('Logout');
        },
        userName: auth.role,
      }}
      sidebarProps={{
        items: navigationItems,
        width: 200,
        collapsedWidth: 80,
        currentPath: location.pathname,
        onNavigate: (path) => navigate(path),
      }}
    >
      <HealthBanner />
      <Outlet />
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
        element: <DashboardPage />,
      },
      {
        path: '/audit',
        element: <AuditListPage />,
      },
      {
        path: '/release',
        element: <ReleasePage />,
      },
      {
        path: '/devlink',
        element: <DevlinkPage />,
      },
      {
        path: '/mind',
        element: <MindPage />,
      },
      {
        path: '/analytics',
        element: <AnalyticsPage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

