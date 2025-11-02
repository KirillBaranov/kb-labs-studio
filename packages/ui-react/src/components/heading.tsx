import * as React from 'react';
import { cn } from '../lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

const levelMap = {
  1: 'typo-page-title',
  2: 'typo-section-title',
  3: 'typo-card-title',
  4: 'typo-section-title', // Reuse section title for h4
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, children, className, ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;
    return React.createElement(
      Component,
      {
        ref,
        className: cn(levelMap[level], className),
        ...props,
      },
      children
    );
  }
);
Heading.displayName = 'Heading';

