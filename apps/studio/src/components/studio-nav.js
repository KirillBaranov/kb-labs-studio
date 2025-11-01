import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { Home, ShieldCheck, Rocket, Link2, Brain, BarChart3, Settings } from 'lucide-react';
import { cn, ThemeToggle } from '@kb-labs/ui-react';
const navigation = [
    { name: 'Dashboard', to: '/', icon: Home },
    { name: 'Audit', to: '/audit', icon: ShieldCheck },
    { name: 'Release', to: '/release', icon: Rocket },
    { name: 'DevLink', to: '/devlink', icon: Link2 },
    { name: 'Mind', to: '/mind', icon: Brain },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: 'Settings', to: '/settings', icon: Settings },
];
export function StudioNav() {
    const location = useLocation();
    return (_jsx("nav", { className: "bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700", children: _jsx("div", { className: "container mx-auto", children: _jsxs("div", { className: "flex items-center space-x-8", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx("h1", { className: "text-xl font-bold text-gray-900 dark:text-white", children: "KB Labs Studio" }) }), _jsx("div", { className: "flex space-x-1", children: navigation.map((item) => {
                            const isActive = location.pathname === item.to;
                            const Icon = item.icon;
                            return (_jsxs(Link, { to: item.to, className: cn('flex items-center space-x-2 px-3 py-4 text-sm font-medium transition-colors', isActive
                                    ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300 border-b-2 border-transparent dark:text-gray-400 dark:hover:text-white'), children: [_jsx(Icon, { className: "h-5 w-5" }), _jsx("span", { children: item.name })] }, item.name));
                        }) }), _jsx("div", { className: "ml-auto", children: _jsx(ThemeToggle, {}) })] }) }) }));
}
//# sourceMappingURL=studio-nav.js.map