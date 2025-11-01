import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { AuditListPage } from './modules/audit/pages/audit-list-page';
import { ReleasePage } from './modules/release/pages/release-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { DevlinkPage } from './modules/devlink/pages/devlink-page';
import { MindPage } from './modules/mind/pages/mind-page';
import { AnalyticsPage } from './modules/analytics/pages/analytics-page';

export const router = createBrowserRouter([
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
]);

