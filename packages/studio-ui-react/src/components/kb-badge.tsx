import * as React from 'react';
import { Badge, Tag } from 'antd';
import type { BadgeProps } from 'antd';
import type { TagProps } from 'antd';

export interface KBBadgeProps extends Omit<TagProps, 'color'> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'processing' | 'dot';
  children?: React.ReactNode;
}

const variantColors: Record<string, string> = {
  default: 'default',
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'processing',
  processing: 'processing',
  dot: 'processing',
};

export function KBBadge({ variant = 'default', children, ...props }: KBBadgeProps) {
  const color = variantColors[variant] || 'default';

  if (variant === 'dot') {
    return (
      <Badge dot {...props}>
        {children}
      </Badge>
    );
  }

  return (
    <Tag color={color} {...props}>
      {children}
    </Tag>
  );
}

