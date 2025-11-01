import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleasePreview, useRunRelease } from '@kb-labs/data-client';
import { KBCard, KBCardHeader, KBCardTitle, KBCardContent, KBButton, KBSkeleton } from '@kb-labs/ui-react';
export function ReleasePage() {
    const sources = useDataSources();
    const { data, isLoading } = useReleasePreview(sources.release);
    const { mutate: runRelease, isPending } = useRunRelease(sources.release);
    const [activeTab, setActiveTab] = useState('packages');
    const handleRun = () => {
        if (window.confirm('Are you sure you want to run the release?')) {
            runRelease(true);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Release" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Package release preview and execution" })] }), _jsx(KBButton, { onClick: handleRun, disabled: isPending || isLoading, children: isPending ? 'Running...' : 'Run Release' })] }), _jsxs(KBCard, { children: [_jsx(KBCardHeader, { children: _jsx(KBCardTitle, { children: "Release Preview" }) }), _jsx(KBCardContent, { children: isLoading ? (_jsxs("div", { className: "space-y-2", children: [_jsx(KBSkeleton, { className: "h-8 w-full" }), _jsx(KBSkeleton, { className: "h-8 w-full" }), _jsx(KBSkeleton, { className: "h-8 w-full" })] })) : data ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mb-4 border-b border-gray-200", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [_jsx("button", { onClick: () => setActiveTab('packages'), className: `border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'packages'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`, children: "Packages" }), _jsx("button", { onClick: () => setActiveTab('markdown'), className: `border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'markdown'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`, children: "Markdown" }), _jsx("button", { onClick: () => setActiveTab('json'), className: `border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'json'
                                                    ? 'border-blue-500 text-blue-600'
                                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`, children: "JSON" })] }) }), _jsxs("div", { className: "mt-4", children: [activeTab === 'packages' && (_jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["From: ", _jsx("span", { className: "font-mono", children: data.range.from }), " \u2192 To: ", _jsx("span", { className: "font-mono", children: data.range.to })] }), _jsx("div", { className: "space-y-2", children: data.packages.map((pkg, idx) => (_jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 pb-2", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: pkg.name }), _jsxs("p", { className: "text-sm text-gray-500", children: [pkg.prev, " \u2192 ", pkg.next, " (", pkg.bump, ")"] })] }), pkg.breaking && (_jsxs("span", { className: "rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800", children: [pkg.breaking, " breaking"] }))] }, idx))) })] })), activeTab === 'markdown' && (_jsx("pre", { className: "overflow-x-auto rounded-md bg-gray-50 p-4 text-sm", children: data.markdown })), activeTab === 'json' && (_jsx("pre", { className: "overflow-x-auto rounded-md bg-gray-50 p-4 text-sm", children: JSON.stringify(data, null, 2) }))] })] })) : (_jsx("p", { className: "text-gray-500", children: "No release preview data available" })) })] })] }));
}
//# sourceMappingURL=release-page.js.map