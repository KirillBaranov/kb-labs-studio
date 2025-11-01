import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDataSources } from '@/providers/data-sources-provider';
import { useHealthStatus } from '@kb-labs/data-client';
import { KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBSkeleton } from '@kb-labs/ui-react';
import { HealthIndicator } from '@/components/health-indicator';
export function SettingsPage() {
    const sources = useDataSources();
    const { data, isLoading } = useHealthStatus(sources.system);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Settings" }), _jsx("p", { className: "mt-2", children: "Configure Studio and manage data sources" })] }), _jsxs(KBCard, { children: [_jsx(KBCardHeader, { children: _jsx(KBCardTitle, { children: "Data Sources Health" }) }), _jsx(KBCardContent, { children: isLoading ? (_jsxs("div", { className: "space-y-2", children: [_jsx(KBSkeleton, { className: "h-8 w-full" }), _jsx(KBSkeleton, { className: "h-8 w-full" }), _jsx(KBSkeleton, { className: "h-8 w-full" })] })) : data ? (_jsx("div", { className: "space-y-2", children: data.sources.map((source) => (_jsxs("div", { className: "flex items-center justify-between border-b border-theme pb-2", children: [_jsx("span", { className: "font-medium", children: source.name }), _jsxs("div", { className: "flex items-center gap-3", children: [source.latency && (_jsxs("span", { className: "text-sm", children: [source.latency, "ms"] })), _jsx(HealthIndicator, { status: source.ok ? 'ok' : 'down' })] })] }, source.name))) })) : (_jsx("p", { children: "No health data available" })) })] })] }));
}
//# sourceMappingURL=settings-page.js.map