import * as React from 'react';
import { cn } from '../lib/utils';

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (columnId: string) => {
    const column = columns.find((c) => c.id === columnId);
    if (!column?.sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === columnId) {
        return prev.direction === 'asc' ? { key: columnId, direction: 'desc' } : null;
      }
      return { key: columnId, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

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

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700', className)}>
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                onClick={() => handleSort(column.id)}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400',
                  column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none'
                )}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <span className="text-gray-400">
                      {sortConfig?.key === column.id
                        ? sortConfig.direction === 'asc'
                          ? '↑'
                          : '↓'
                        : '⇅'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
          {sortedData.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50')}
            >
              {columns.map((column) => {
                const value = row[column.id as keyof T];
                return (
                  <td key={column.id} className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {column.render ? column.render(value, row) : String(value || '')}
                  </td>
                );
              })}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

