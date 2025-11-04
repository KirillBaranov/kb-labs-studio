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
        const { w, h, minW, minH } = layoutHint;

        return (
          <div
            key={index}
            className="widget-dashboard-grid__item"
            style={
              {
                gridColumn: `span ${w}`,
                gridRow: `span ${h}`,
                minWidth: minW ? `${minW * (100 / cols.lg)}%` : undefined,
                minHeight: minH ? `${minH * rowHeight}px` : undefined,
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
          grid-auto-rows: var(--row-height);
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
        }
      `}</style>
    </div>
  );
}


