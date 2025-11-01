import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, Rocket, Link2, Brain, BarChart3, Settings, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { cn, KBBadge } from '@kb-labs/ui-react';
import { useSidebar } from './sidebar-context';
const navigation = [
    {
        name: 'Dashboard',
        to: '/',
        icon: Home,
        subItems: [
            { name: 'Overview', to: '/dashboard/overview' },
            { name: 'Metrics', to: '/dashboard/metrics' },
            { name: 'Recent Activity', to: '/dashboard/activity' },
        ],
    },
    {
        name: 'Audit',
        to: '/audit',
        icon: ShieldCheck,
        subItems: [
            { name: 'Summary', to: '/audit/summary' },
            { name: 'Packages', to: '/audit/packages' },
            { name: 'Reports', to: '/audit/reports' },
        ],
    },
    {
        name: 'Release',
        to: '/release',
        icon: Rocket,
        subItems: [
            { name: 'Preview', to: '/release/preview' },
            { name: 'History', to: '/release/history' },
            { name: 'Settings', to: '/release/settings' },
        ],
    },
    {
        name: 'DevLink',
        to: '/devlink',
        icon: Link2,
        subItems: [
            { name: 'Graph', to: '/devlink/graph' },
            { name: 'Cycles', to: '/devlink/cycles' },
            { name: 'Dependencies', to: '/devlink/dependencies' },
        ],
    },
    {
        name: 'Mind',
        to: '/mind',
        icon: Brain,
        subItems: [
            { name: 'Verification', to: '/mind/verification' },
            { name: 'Freshness', to: '/mind/freshness' },
            { name: 'Reports', to: '/mind/reports' },
        ],
    },
    {
        name: 'Analytics',
        to: '/analytics',
        icon: BarChart3,
        subItems: [
            { name: 'Events', to: '/analytics/events' },
            { name: 'Performance', to: '/analytics/performance' },
            { name: 'Usage', to: '/analytics/usage' },
        ],
    },
    {
        name: 'Settings',
        to: '/settings',
        icon: Settings,
        subItems: [
            { name: 'General', to: '/settings/general' },
            { name: 'Data Sources', to: '/settings/data-sources' },
            { name: 'Preferences', to: '/settings/preferences' },
        ],
    },
];
export function StudioSidebar() {
    const location = useLocation();
    const { collapsed, toggleCollapse } = useSidebar();
    const [expandedItems, setExpandedItems] = React.useState({});
    const toggleExpand = (itemName) => {
        setExpandedItems((prev) => ({
            ...prev,
            [itemName]: !prev[itemName],
        }));
    };
    return (_jsx("aside", { className: cn('fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300', collapsed ? 'w-16' : 'w-60'), children: _jsxs("nav", { className: "h-full flex flex-col", children: [_jsx("div", { className: "flex-1 overflow-y-auto py-4", children: _jsx("ul", { className: "space-y-1 px-2", children: navigation.map((item) => {
                            const isActive = location.pathname === item.to;
                            const isExpanded = expandedItems[item.name] ?? false;
                            const Icon = item.icon;
                            return (_jsxs("li", { children: [_jsxs("div", { className: "flex items-center", children: [_jsxs(Link, { to: item.to, className: cn('flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-1', isActive
                                                    ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500 dark:bg-blue-900/50 dark:text-blue-400'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'), children: [_jsx(Icon, { className: "h-5 w-5 flex-shrink-0" }), !collapsed && _jsx("span", { children: item.name })] }), !collapsed && item.subItems.length > 0 && (_jsx("button", { onClick: () => toggleExpand(item.name), className: "p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors", children: _jsx(ChevronDown, { className: cn('h-4 w-4 text-gray-500 transition-transform', isExpanded && 'rotate-180') }) }))] }), !collapsed && isExpanded && (_jsx("ul", { className: "mt-1 ml-4 space-y-1", children: item.subItems.map((subItem) => (_jsx("li", { children: _jsxs(Link, { to: subItem.to, className: "flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/30 rounded-md transition-colors", children: [_jsx("span", { className: "flex-1", children: subItem.name }), _jsx(KBBadge, { variant: "default", className: "text-[10px]", children: "Soon" })] }) }, subItem.to))) }))] }, item.name));
                        }) }) }), _jsx("div", { className: "border-t border-gray-200 dark:border-gray-700 p-2", children: _jsx("button", { onClick: toggleCollapse, className: "flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50 rounded-lg transition-colors", children: collapsed ? (_jsx(ChevronRight, { className: "h-5 w-5" })) : (_jsxs(_Fragment, { children: [_jsx(ChevronLeft, { className: "h-5 w-5" }), _jsx("span", { className: "ml-2", children: "Collapse" })] })) }) })] }) }));
}
//# sourceMappingURL=studio-sidebar.js.map