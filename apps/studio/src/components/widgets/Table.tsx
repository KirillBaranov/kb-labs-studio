/**
 * @module @kb-labs/studio-app/components/widgets/Table
 * Table widget - pagination, sorting, sticky header
 */

import * as React from 'react';
import { Skeleton, EmptyState, ErrorState } from './utils/index.js';
import { WidgetCard } from './WidgetCard.js';
import type { BaseWidgetProps } from './types.js';
import { KBDataTable } from '@kb-labs/ui-react';
import type { Column } from '@kb-labs/ui-react';

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
  
  // Hooks must be called before early returns
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = React.useState<number>(400);

  React.useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    
    const updateHeight = () => {
      const container = containerRef.current;
      if (!container) {
        return;
      }
      
      // Get container height
      const height = container.clientHeight;
      // Subtract pagination height (approximately 60-80px)
      const tableHeight = Math.max(200, height - 80);
      setScrollY(tableHeight);
    };

    updateHeight();
    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

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

  // Convert data to columns if not provided
  const tableColumns: Column<T>[] = columns.length > 0
    ? columns
    : Object.keys(rows[0] || {}).map((key) => ({
        id: key,
        label: key,
        sortable,
        render: (value: unknown) => String(value ?? ''),
      }));

  const tableContent = (
    <div 
      ref={containerRef}
      className="widget-table" 
      style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 0,
        overflow: 'hidden',
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
          y: scrollY,
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
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
    >
      {tableContent}
    </WidgetCard>
  ) : (
    tableContent
  );
}


