/**
 * UIButton component - Action button with semantic variants
 *
 * Wraps Ant Design Button with consistent styling.
 * NO hardcoded colors, uses Ant Design theme.
 */

import * as React from 'react';
import { Button as AntButton } from 'antd';

export type UIButtonVariant = 'primary' | 'default' | 'dashed' | 'text' | 'link';
export type UIButtonSize = 'small' | 'middle' | 'large';

export interface UIButtonProps {
  /** Button variant */
  variant?: UIButtonVariant;
  /** Button size */
  size?: UIButtonSize;
  /** Danger mode (red button) */
  danger?: boolean;
  /** Icon element */
  icon?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  block?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Button content */
  children?: React.ReactNode;
}

/**
 * UIButton - Action button
 *
 * @example
 * ```tsx
 * <UIButton variant="primary">Submit</UIButton>
 * <UIButton variant="default" icon={<SearchIcon />}>Search</UIButton>
 * <UIButton variant="text" danger>Delete</UIButton>
 * ```
 */
export function UIButton({
  variant = 'default',
  size = 'middle',
  danger,
  icon,
  loading,
  disabled,
  block,
  onClick,
  children,
  ...rest
}: UIButtonProps) {
  return (
    <AntButton
      type={variant}
      size={size}
      danger={danger}
      icon={icon}
      loading={loading}
      disabled={disabled}
      block={block}
      onClick={onClick}
      {...rest}
    >
      {children}
    </AntButton>
  );
}
