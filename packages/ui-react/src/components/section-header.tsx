import * as React from 'react';
import { cn } from '../lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ title, description, action, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between', className)}
        style={{ marginBottom: 'var(--spacing-item)' }}
      >
        <div style={{ gap: 'var(--spacing-tight)' }} className="flex flex-col">
          <h2 className="typo-section-title">{title}</h2>
          {description && <p className="typo-description">{description}</p>}
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';

