import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { ThemeToggle } from '@kb-labs/ui-react';
export function StudioHeader() {
    return (_jsx("header", { className: "fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700", children: _jsxs("div", { className: "flex items-center justify-between h-full px-6", children: [_jsx(Link, { to: "/", className: "text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors", children: "KB Labs Studio" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ThemeToggle, {}), _jsx("div", { className: "flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400", children: _jsx(User, { className: "h-5 w-5" }) })] })] }) }));
}
//# sourceMappingURL=studio-header.js.map