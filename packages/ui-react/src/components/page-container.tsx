import * as React from 'react';
import { cn } from '../lib/utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', className)}
        style={{
          padding: 'var(--spacing-page)',
          gap: 'var(--spacing-page)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PageContainer.displayName = 'PageContainer';

