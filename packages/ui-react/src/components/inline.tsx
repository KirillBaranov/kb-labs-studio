import * as React from 'react';
import { cn } from '../lib/utils';

export interface InlineProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'default' | 'loose';
  align?: 'start' | 'center' | 'end' | 'between';
  children: React.ReactNode;
}

const spacingMap = {
  tight: 'var(--spacing-tight)',
  default: 'var(--spacing-item)',
  loose: 'var(--spacing-section)',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  between: 'items-center justify-between',
};

export const Inline = React.forwardRef<HTMLDivElement, InlineProps>(
  ({ spacing = 'default', align = 'start', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex', alignMap[align], className)}
        style={{ gap: spacingMap[spacing] }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Inline.displayName = 'Inline';

