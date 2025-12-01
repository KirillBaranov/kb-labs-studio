/**
 * @module @kb-labs/studio-app/components/widgets/Table
 * Table widget - pagination, sorting, sticky header
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index';
import { WidgetCard } from './WidgetCard';
import type { BaseWidgetProps } from './types';
import { KBDataTable } from '@kb-labs/studio-ui-react';
import type { Column } from '@kb-labs/studio-ui-react';

export interface TableOptions<T = unknown> {
  columns?: Column<T>[];
  pageSize?: number;
  sortable?: boolean;
  stickyHeader?: boolean;
  /** Show card wrapper (default: true) */
  showCard?: boolean;
}

export interface TableProps<T = unknown> extends BaseWidgetProps<T[], TableOptions<T>> {
  onRowClick?: (row: T) => void;
}

export function Table<T extends Record<string, unknown>>({ 
  data, 
  loading, 
  error, 
  options, 
  onRowClick,
  title,
  description,
  showTitle = false,
  showDescription = false,
}: TableProps<T>) {
  const showCard = options?.showCard !== false;

  if (loading) {
    const content = <Skeleton variant="table" rows={5} />;
    return showCard ? (
      <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
        {content}
      </WidgetCard>
    ) : (
      content
    );
  }

  if (error) {
    const content = <ErrorState error={error} />;
    return showCard ? (
      <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
        {content}
      </WidgetCard>
    ) : (
      content
    );
  }

  const rows: T[] = Array.isArray(data) ? data : Array.isArray((data as any)?.rows) ? ((data as any).rows as T[]) : [];

  if (!rows || rows.length === 0) {
    const content = <EmptyState title="No data" description="No table data available" />;
    return showCard ? (
      <WidgetCard title={title} description={description} showTitle={showTitle} showDescription={showDescription}>
        {content}
      </WidgetCard>
    ) : (
      content
    );
  }

  const columns = options?.columns || [];
  const pageSize = options?.pageSize || 20;
  const sortable = options?.sortable !== false;

  // Helper function to render cell values properly
  const renderCellValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? JSON.stringify(value) : '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  // Convert data to columns if not provided
  const tableColumns: Column<T>[] = columns.length > 0
    ? columns
    : Object.keys(rows[0] || {}).map((key) => ({
        id: key,
        label: key,
        sortable,
        render: renderCellValue,
      }));

  const tableContent = (
    <div 
      className="widget-table" 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0,
      }}
    >
      <KBDataTable<T>
        columns={tableColumns}
        data={rows}
        onRowClick={onRowClick}
        pagination={{
          pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        scroll={{
          x: 'max-content',
        }}
      />
    </div>
  );

  return showCard ? (
    <WidgetCard 
      title={title} 
      description={description} 
      showTitle={showTitle} 
      showDescription={showDescription}
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}
    >
      {tableContent}
    </WidgetCard>
  ) : (
    tableContent
  );
}


