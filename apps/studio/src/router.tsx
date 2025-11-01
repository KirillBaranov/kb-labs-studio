import { createBrowserRouter, Outlet } from 'react-router-dom';
import { StudioHeader } from './components/studio-header';
import { StudioSidebar } from './components/studio-sidebar';
import { SidebarProvider, useSidebar } from './components/sidebar-context';
import { HealthBanner } from './components/health-banner';
import { DashboardPage } from './modules/dashboard/pages/dashboard-page';
import { AuditListPage } from './modules/audit/pages/audit-list-page';
import { ReleasePage } from './modules/release/pages/release-page';
import { SettingsPage } from './modules/settings/pages/settings-page';
import { DevlinkPage } from './modules/devlink/pages/devlink-page';
import { MindPage } from './modules/mind/pages/mind-page';
import { AnalyticsPage } from './modules/analytics/pages/analytics-page';

function LayoutContent() {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-theme-secondary">
      <StudioHeader />
      <StudioSidebar />
      <main className={`pt-16 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <HealthBanner />
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Layout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
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

