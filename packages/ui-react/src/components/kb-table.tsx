import * as React from 'react';
import { Table } from 'antd';
import type { TableProps } from 'antd/es/table';

export interface Column<T> {
  id: string;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

export interface KBDataTableProps<T extends Record<string, unknown>> extends Omit<TableProps<T>, 'columns' | 'dataSource'> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export function KBDataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  ...props
}: KBDataTableProps<T>) {
  const tableColumns = columns.map((col) => ({
    title: col.label,
    dataIndex: col.id,
    key: col.id,
    sorter: col.sortable
      ? (a: T, b: T) => {
          const aVal = a[col.id as keyof T];
          const bVal = b[col.id as keyof T];
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return aVal.localeCompare(bVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return aVal - bVal;
          }
          return 0;
        }
      : undefined,
    render: col.render,
  }));

  return (
    <Table<T>
      columns={tableColumns}
      dataSource={data.map((row, index) => ({ ...row, key: index }))}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        style: onRowClick ? { cursor: 'pointer' } : undefined,
      })}
      pagination={false}
      showSorterTooltip={false} // Disable tooltips on sortable columns to prevent UI artifacts
      // Override Ant Design's default table styles to use CSS variables
      className="kb-table"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        ...props.style,
      }}
      {...props}
    />
  );
}

