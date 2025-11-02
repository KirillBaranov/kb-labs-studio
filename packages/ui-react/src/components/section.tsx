import * as React from 'react';
import { cn } from '../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
  spacing?: 'tight' | 'default' | 'loose';
}

const spacingMap = {
  tight: 'var(--spacing-tight)',
  default: 'var(--spacing-item)',
  loose: 'var(--spacing-section)',
};

export const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ title, description, children, spacing = 'default', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col', className)}
        style={{
          marginTop: 'var(--spacing-section)',
          gap: spacingMap[spacing],
        }}
        {...props}
      >
        {(title || description) && (
          <div style={{ gap: 'var(--spacing-item)' }} className="flex flex-col">
            {title && <h2 className="typo-section-title">{title}</h2>}
            {description && <p className="typo-description">{description}</p>}
          </div>
        )}
        {children}
      </div>
    );
  }
);
Section.displayName = 'Section';

