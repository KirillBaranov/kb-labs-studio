import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { cn } from '../lib/utils';
export function DataTable({ columns, data, onRowClick, className, }) {
    const [sortConfig, setSortConfig] = React.useState(null);
    const handleSort = (columnId) => {
        const column = columns.find((c) => c.id === columnId);
        if (!column?.sortable)
            return;
        setSortConfig((prev) => {
            if (prev?.key === columnId) {
                return prev.direction === 'asc' ? { key: columnId, direction: 'desc' } : null;
            }
            return { key: columnId, direction: 'asc' };
        });
    };
    const sortedData = React.useMemo(() => {
        if (!sortConfig)
            return data;
        const sorted = [...data].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (aVal === null || aVal === undefined)
                return 1;
            if (bVal === null || bVal === undefined)
                return -1;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortConfig.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return 0;
        });
        return sorted;
    }, [data, sortConfig]);
    return (_jsx("div", { className: cn('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700', className), children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 dark:bg-gray-900", children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { onClick: () => handleSort(column.id), className: cn('px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400', column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none'), children: _jsxs("div", { className: "flex items-center space-x-1", children: [_jsx("span", { children: column.label }), column.sortable && (_jsx("span", { className: "text-gray-400", children: sortConfig?.key === column.id
                                            ? sortConfig.direction === 'asc'
                                                ? '↑'
                                                : '↓'
                                            : '⇅' }))] }) }, column.id))) }) }), _jsxs("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800", children: [sortedData.map((row, rowIdx) => (_jsx("tr", { onClick: () => onRowClick?.(row), className: cn(onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'), children: columns.map((column) => {
                                const value = row[column.id];
                                return (_jsx("td", { className: "whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100", children: column.render ? column.render(value, row) : String(value || '') }, column.id));
                            }) }, rowIdx))), sortedData.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400", children: "No data available" }) }))] })] }) }));
}
//# sourceMappingURL=data-table.js.map