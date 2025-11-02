import * as React from 'react';
import { cn } from '../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'tight' | 'default' | 'loose';
  children: React.ReactNode;
}

const spacingMap = {
  tight: 'var(--spacing-tight)',
  default: 'var(--spacing-item)',
  loose: 'var(--spacing-section)',
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ spacing = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', className)}
        style={{ gap: spacingMap[spacing] }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = 'Stack';

