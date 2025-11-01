import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import { StatCard } from '@kb-labs/ui-react';
export function DashboardKpis() {
    const sources = useDataSources();
    const { data, isLoading } = useAuditSummary(sources.audit);
    if (isLoading) {
        return _jsx("div", { children: "Loading KPIs..." });
    }
    if (!data) {
        return _jsx("div", { children: "No data available" });
    }
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(StatCard, { label: "Audit Duration", value: `${data.totals.durationMs}ms` }), _jsx(StatCard, { label: "Packages OK", value: `${data.totals.ok}/${data.totals.packages}`, variant: "positive" }), _jsx(StatCard, { label: "Failed", value: data.totals.fail, variant: "negative" }), _jsx(StatCard, { label: "Warnings", value: data.totals.warn, variant: "warning" })] }));
}
//# sourceMappingURL=dashboard-kpis.js.map