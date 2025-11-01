import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { AlertTriangle } from 'lucide-react';
export function HealthBanner() {
    const sources = useDataSources();
    const { data } = useHealthStatus(sources.system);
    if (!data || data.ok) {
        return null;
    }
    const failedSources = data.sources.filter((s) => !s.ok);
    const isDegraded = failedSources.length < data.sources.length && failedSources.length > 0;
    return (_jsx("div", { className: "border-b border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20", children: _jsx("div", { className: "container mx-auto px-4 py-3", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600 dark:text-yellow-400" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-yellow-800 dark:text-yellow-200", children: isDegraded ? 'Degraded Mode' : 'Critical Error' }), _jsxs("p", { className: "text-sm text-yellow-700 dark:text-yellow-300", children: [failedSources.map((s) => s.name).join(', '), " unavailable"] })] })] }) }) }));
}
//# sourceMappingURL=health-banner.js.map