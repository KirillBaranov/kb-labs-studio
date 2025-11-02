import * as React from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';

export interface KBButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'default' | 'primary' | 'dashed' | 'text' | 'link';
  size?: 'small' | 'middle' | 'large';
}

export function KBButton({
  variant = 'default',
  size = 'middle',
  ...props
}: KBButtonProps) {
  const type: ButtonProps['type'] =
    variant === 'primary'
      ? 'primary'
      : variant === 'dashed'
      ? 'dashed'
      : variant === 'text'
      ? 'text'
      : variant === 'link'
      ? 'link'
      : 'default';

  return <Button type={type} size={size} {...props} />;
}

