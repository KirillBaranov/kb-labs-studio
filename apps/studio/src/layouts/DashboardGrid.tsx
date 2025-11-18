/**
 * @module @kb-labs/studio-app/layouts/DashboardGrid
 * Dashboard Grid layout - responsive CSS Grid
 */

import * as React from 'react';

export interface DashboardGridProps {
  children: React.ReactNode;
  cols?: {
    sm: number;
    md: number;
    lg: number;
  };
  rowHeight?: number;
  gap?: number;
}

export function DashboardGrid({ children, cols = { sm: 4, md: 8, lg: 12 }, rowHeight = 8, gap = 16 }: DashboardGridProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      className="widget-dashboard-grid"
      style={
        {
          '--cols-sm': cols.sm,
          '--cols-md': cols.md,
          '--cols-lg': cols.lg,
          '--row-height': `${rowHeight * 8}px`,
          '--gap': `${gap}px`,
        } as React.CSSProperties
      }
    >
      {childrenArray.map((child, index) => {
        // Extract layoutHint from child props if available
        const layoutHint = (child as React.ReactElement)?.props?.layoutHint || { w: 4, h: 4 };
        const { w, h, minW, minH, height } = layoutHint;

        // Calculate height based on layoutHint.height
        let itemHeight: string | undefined;
        let itemMaxHeight: string | undefined;
        let itemMinHeight: string | undefined;

        if (height === 'fit-content') {
          itemHeight = 'fit-content';
        } else if (typeof height === 'number') {
          itemHeight = `${height}px`;
        } else if (height === 'auto' || height === undefined) {
          // Auto height: use grid rows but allow content to expand
          itemMinHeight = minH ? `${minH * rowHeight * 8}px` : `${h * rowHeight * 8}px`;
          // Limit max height to prevent widgets from taking entire page
          // Use viewport height minus header/footer/padding (approximately 200px)
          itemMaxHeight = 'calc(100vh - 200px)';
        } else {
          // Fallback: use grid-based height calculation
          itemMinHeight = minH ? `${minH * rowHeight * 8}px` : `${h * rowHeight * 8}px`;
          itemMaxHeight = 'calc(100vh - 200px)';
        }

        return (
          <div
            key={index}
            className="widget-dashboard-grid__item"
            style={
              {
                gridColumn: `span ${w}`,
                gridRow: height === 'fit-content' ? 'span 1' : `span ${h}`,
                minWidth: minW ? `${minW * (100 / cols.lg)}%` : undefined,
                minHeight: itemMinHeight,
                height: itemHeight,
                maxHeight: itemMaxHeight,
              } as React.CSSProperties
            }
          >
            {child}
          </div>
        );
      })}
      <style>{`
        .widget-dashboard-grid {
          display: grid;
          grid-template-columns: repeat(var(--cols-sm), 1fr);
          gap: var(--gap);
          grid-auto-rows: minmax(var(--row-height), auto);
          align-items: start;
        }
        @media (min-width: 768px) {
          .widget-dashboard-grid {
            grid-template-columns: repeat(var(--cols-md), 1fr);
          }
        }
        @media (min-width: 1024px) {
          .widget-dashboard-grid {
            grid-template-columns: repeat(var(--cols-lg), 1fr);
          }
        }
        .widget-dashboard-grid__item {
          min-height: var(--row-height);
          display: flex;
          flex-direction: column;
          overflow: hidden; /* Changed to hidden to contain overflow */
        }
        .widget-dashboard-grid__item > * {
          flex: 1;
          min-height: 0;
          overflow: hidden; /* Changed to hidden to contain overflow */
        }
      `}</style>
    </div>
  );
}


