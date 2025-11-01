import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx(StudioHeader, {}), _jsx(StudioSidebar, {}), _jsxs("main", { className: `pt-16 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`, children: [_jsx(HealthBanner, {}), _jsx("div", { className: "p-8", children: _jsx(Outlet, {}) })] })] }));
}
function Layout() {
    return (_jsx(SidebarProvider, { children: _jsx(LayoutContent, {}) }));
}
export const router = createBrowserRouter([
    {
        element: _jsx(Layout, {}),
        children: [
            {
                path: '/',
                element: _jsx(DashboardPage, {}),
            },
            {
                path: '/audit',
                element: _jsx(AuditListPage, {}),
            },
            {
                path: '/release',
                element: _jsx(ReleasePage, {}),
            },
            {
                path: '/devlink',
                element: _jsx(DevlinkPage, {}),
            },
            {
                path: '/mind',
                element: _jsx(MindPage, {}),
            },
            {
                path: '/analytics',
                element: _jsx(AnalyticsPage, {}),
            },
            {
                path: '/settings',
                element: _jsx(SettingsPage, {}),
            },
        ],
    },
]);
//# sourceMappingURL=router.js.map