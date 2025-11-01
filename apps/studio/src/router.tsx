import { createBrowserRouter, Outlet } from 'react-router-dom';
import { StudioNav } from './components/studio-nav';
import { HealthBanner } from './components/health-banner';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { AuditListPage } from './modules/audit/pages/audit-list-page';
import { ReleasePage } from './modules/release/pages/release-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { DevlinkPage } from './modules/devlink/pages/devlink-page';
import { MindPage } from './modules/mind/pages/mind-page';
import { AnalyticsPage } from './modules/analytics/pages/analytics-page';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudioNav />
      <HealthBanner />
      <div className="container mx-auto py-8">
        <Outlet />
      </div>
    </div>
  );
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
]);

