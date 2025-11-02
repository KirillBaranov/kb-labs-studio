import * as React from 'react';
import { cn } from '../lib/utils';

export interface StatGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

const gridMap = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export const StatGrid = React.forwardRef<HTMLDivElement, StatGridProps>(
  ({ columns = 4, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid', gridMap[columns], className)}
        style={{ gap: 'var(--spacing-item)' }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
StatGrid.displayName = 'StatGrid';

