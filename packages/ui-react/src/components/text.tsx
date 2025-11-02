import * as React from 'react';
import { cn } from '../lib/utils';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'body' | 'description' | 'label' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

const variantMap = {
  body: 'typo-body',
  description: 'typo-description',
  label: 'typo-label',
  caption: 'typo-caption',
};

const colorMap = {
  primary: '',
  secondary: '',
  tertiary: '',
  error: 'text-error',
  success: 'text-success',
  warning: 'text-warning',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ variant = 'body', color = 'primary', children, as: Component = 'p', className, ...props }, ref) => {
    return React.createElement(
      Component,
      {
        ref,
        className: cn(variantMap[variant], colorMap[color], className),
        ...props,
      },
      children
    );
  }
);
Text.displayName = 'Text';

