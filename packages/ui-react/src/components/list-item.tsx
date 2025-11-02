import * as React from 'react';
import { cn } from '../lib/utils';

export interface ListItemProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ icon, title, description, action, onClick, className }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex items-center justify-between border-b border-theme last:border-b-0',
          onClick && 'cursor-pointer hover:bg-theme-secondary transition-colors',
          className
        )}
        style={{ padding: 'var(--spacing-item)' }}
      >
        <div className="flex items-center" style={{ gap: 'var(--spacing-item)' }}>
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div className="flex flex-col" style={{ gap: 'var(--spacing-tight)' }}>
            <div className="typo-body">{title}</div>
            {description && <div className="typo-description">{description}</div>}
          </div>
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>
    );
  }
);
ListItem.displayName = 'ListItem';

