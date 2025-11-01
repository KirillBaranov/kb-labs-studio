import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useAuditSummary } from '@kb-labs/data-client';
import { KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBSkeleton, KBButton, DataTable, } from '@kb-labs/ui-react';
import { AuditReportDrawer } from '../components/audit-report-drawer';
export function AuditListPage() {
    const sources = useDataSources();
    const { data, isLoading } = useAuditSummary(sources.audit);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const columns = [
        {
            id: 'package',
            label: 'Package',
            sortable: true,
        },
        {
            id: 'ok',
            label: 'OK',
            sortable: true,
        },
        {
            id: 'warn',
            label: 'Warnings',
            sortable: true,
        },
        {
            id: 'fail',
            label: 'Failures',
            sortable: true,
        },
    ];
    const tableData = data?.topFailures.map((failure) => ({
        package: failure.pkg,
        ok: 0,
        warn: 0,
        fail: failure.checks.length,
    })) || [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Audit" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Package audit results and reports" })] }), _jsx(KBButton, { children: "Run Audit" })] }), _jsxs(KBCard, { children: [_jsx(KBCardHeader, { children: _jsx(KBCardTitle, { children: "Summary" }) }), _jsx(KBCardContent, { children: isLoading ? (_jsxs("div", { className: "space-y-2", children: [_jsx(KBSkeleton, { className: "h-8 w-full" }), _jsx(KBSkeleton, { className: "h-8 w-full" })] })) : data ? (_jsx("div", { className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Total Packages" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: data.totals.packages })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "OK" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: data.totals.ok })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Warnings" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: data.totals.warn })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Failed" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: data.totals.fail })] })] }) })) : null })] }), _jsxs(KBCard, { children: [_jsx(KBCardHeader, { children: _jsx(KBCardTitle, { children: "Packages" }) }), _jsx(KBCardContent, { children: isLoading ? (_jsxs("div", { className: "space-y-2", children: [_jsx(KBSkeleton, { className: "h-10 w-full" }), _jsx(KBSkeleton, { className: "h-10 w-full" }), _jsx(KBSkeleton, { className: "h-10 w-full" })] })) : (_jsx(DataTable, { columns: columns, data: tableData, onRowClick: (row) => setSelectedPackage(row.package) })) })] }), _jsx(AuditReportDrawer, { packageName: selectedPackage, onClose: () => setSelectedPackage(null) })] }));
}
//# sourceMappingURL=audit-list-page.js.map