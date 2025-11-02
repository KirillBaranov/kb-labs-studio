import * as React from 'react';
import { cn } from '../lib/utils';

export interface DataListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DataList = React.forwardRef<HTMLDivElement, DataListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border border-theme bg-theme-primary overflow-hidden', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DataList.displayName = 'DataList';

