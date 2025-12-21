/**
 * @module @kb-labs/studio-ui-react/components/kb-grid-layout
 * Responsive grid layout wrapper around react-grid-layout
 */

import * as React from 'react';
import { GridLayout, type Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Re-export Layout type for consumers
export type { Layout };

export interface KBGridLayoutProps {
  /**
   * Single layout (non-responsive)
   */
  layout?: Layout;
  /**
   * Children with data-grid attribute
   */
  children: React.ReactNode;
  /**
   * Callback when layout changes
   */
  onLayoutChange?: (layout: Layout) => void;
  /**
   * Number of columns (default: 12)
   */
  cols?: number;
  /**
   * Row height in pixels (default: 60)
   */
  rowHeight?: number;
  /**
   * Container width (auto if not provided)
   */
  width?: number;
  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Grid layout component for widgets
 *
 * @example
 * ```tsx
 * <KBGridLayout
 *   layout={[
 *     { i: 'widget-1', x: 0, y: 0, w: 6, h: 4 },
 *     { i: 'widget-2', x: 6, y: 0, w: 6, h: 4 },
 *   ]}
 *   onLayoutChange={(layout) => saveLayout(layout)}
 * >
 *   <div key="widget-1">Widget 1</div>
 *   <div key="widget-2">Widget 2</div>
 * </KBGridLayout>
 * ```
 */
export function KBGridLayout({
  layout,
  children,
  onLayoutChange,
  cols = 12,
  rowHeight = 60,
  width = 1200,
  className = '',
}: KBGridLayoutProps) {
  return (
    <GridLayout
      className={className}
      layout={layout}
      width={width}
      gridConfig={{ cols, rowHeight }}
      dragConfig={{ handle: '.drag-handle' }}
      onLayoutChange={onLayoutChange}
    >
      {children}
    </GridLayout>
  );
}
