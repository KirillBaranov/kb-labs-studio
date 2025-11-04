/**
 * @module @kb-labs/studio-app/components/widgets/Table
 * Table widget - pagination, sorting, sticky header
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import type { BaseWidgetProps } from './types.js';
import { KBDataTable } from '@kb-labs/ui-react';
import type { Column } from '@kb-labs/ui-react';

export interface TableOptions<T = unknown> {
  columns?: Column<T>[];
  pageSize?: number;
  sortable?: boolean;
  stickyHeader?: boolean;
}

export interface TableProps<T = unknown> extends BaseWidgetProps<T[], TableOptions<T>> {
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({ data, loading, error, options, onRowClick }: TableProps<T>) {
  if (loading) {
    return <Skeleton variant="table" rows={5} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title="No data" description="No table data available" />;
  }

  const columns = options?.columns || [];
  const pageSize = options?.pageSize || 20;
  const sortable = options?.sortable !== false;
  const stickyHeader = options?.stickyHeader === true;

  // Convert data to columns if not provided
  const tableColumns: Column<T>[] = columns.length > 0
    ? columns
    : Object.keys(data[0] || {}).map((key) => ({
        id: key,
        label: key,
        sortable,
        render: (value: unknown) => String(value ?? ''),
      }));

  return (
    <div className="widget-table" data-sticky-header={stickyHeader}>
      <KBDataTable<T>
        columns={tableColumns}
        data={data}
        onRowClick={onRowClick}
        pagination={{
          pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />
      <style>{`
        .widget-table[data-sticky-header="true"] {
          position: sticky;
          top: 0;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}


