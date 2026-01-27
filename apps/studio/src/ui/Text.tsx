/**
 * Text component - Typography primitive with design tokens
 *
 * Uses tokens from @kb-labs/studio-ui-core for consistent styling.
 * NO inline styles, NO hardcoded colors.
 */

import * as React from 'react';
import { theme } from 'antd';
import { typography } from '@kb-labs/studio-ui-core';

const { useToken } = theme;

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface TextProps {
  /** Text content */
  children: React.ReactNode;
  /** Typography size from design tokens */
  size?: TextSize;
  /** Font weight from design tokens */
  weight?: TextWeight;
  /** Semantic color using Ant Design tokens */
  color?: TextColor;
  /** HTML element to render */
  as?: 'span' | 'p' | 'div' | 'label';
  /** Additional CSS class */
  className?: string;
}

/**
 * Text component with design system tokens
 *
 * @example
 * ```tsx
 * <Text size="sm" color="secondary">Label text</Text>
 * <Text size="2xl" weight="bold">Heading</Text>
 * ```
 */
export function Text({
  children,
  size = 'base',
  weight = 'normal',
  color = 'primary',
  as: Component = 'span',
  className,
}: TextProps) {
  const { token } = useToken();

  // Map semantic colors to Ant Design tokens
  const colorMap: Record<TextColor, string> = {
    primary: token.colorText,
    secondary: token.colorTextSecondary,
    success: token.colorSuccess,
    warning: token.colorWarning,
    error: token.colorError,
    info: token.colorInfo,
  };

  const style: React.CSSProperties = {
    fontSize: typography.fontSize[size][0],
    lineHeight: typography.fontSize[size][1].lineHeight,
    fontWeight: typography.fontWeight[weight],
    color: colorMap[color],
  };

  return (
    <Component style={style} className={className}>
      {children}
    </Component>
  );
}
