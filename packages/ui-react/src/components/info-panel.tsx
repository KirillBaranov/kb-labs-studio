import * as React from 'react';
import { cn } from '../lib/utils';

export interface InfoPanelItem {
  label: string;
  value: React.ReactNode;
}

export interface InfoPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  items: InfoPanelItem[];
  columns?: 2 | 3 | 4;
}

const gridMap = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

export const InfoPanel = React.forwardRef<HTMLDivElement, InfoPanelProps>(
  ({ items, columns = 4, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid', gridMap[columns], className)}
        style={{ gap: 'var(--spacing-item)' }}
        {...props}
      >
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col" style={{ gap: 'var(--spacing-tight)' }}>
            <div className="typo-label">{item.label}</div>
            <div className="typo-body">{item.value}</div>
          </div>
        ))}
      </div>
    );
  }
);
InfoPanel.displayName = 'InfoPanel';

