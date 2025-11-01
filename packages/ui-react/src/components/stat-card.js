import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../lib/utils';
export function StatCard({ label, value, trend, variant = 'default', className }) {
    const variantClasses = {
        default: 'text-gray-900',
        positive: 'text-green-600',
        negative: 'text-red-600',
        warning: 'text-yellow-600',
    };
    return (_jsxs("div", { className: cn('rounded-lg border bg-white p-6 shadow', className), children: [_jsx("h3", { className: "text-sm font-medium text-gray-500", children: label }), _jsxs("div", { className: "mt-2 flex items-baseline justify-between", children: [_jsx("p", { className: cn('text-2xl font-bold', variantClasses[variant]), children: value }), trend && (_jsxs("span", { className: cn('text-xs font-medium', trend === 'up' && 'text-green-600', trend === 'down' && 'text-red-600', trend === 'neutral' && 'text-gray-600'), children: [trend === 'up' && '↑', trend === 'down' && '↓', trend === 'neutral' && '→'] }))] })] }));
}
//# sourceMappingURL=stat-card.js.map