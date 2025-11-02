import * as React from 'react';
import { cn } from '../lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, description, action, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between', className)}
        style={{ marginBottom: 'var(--spacing-section)' }}
      >
        <div style={{ gap: 'var(--spacing-tight)' }} className="flex flex-col">
          <h1 className="typo-page-title">{title}</h1>
          {description && <p className="typo-description">{description}</p>}
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';

