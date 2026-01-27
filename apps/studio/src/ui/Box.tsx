/**
 * Box component - Layout primitive with spacing tokens
 *
 * Uses tokens from @kb-labs/studio-ui-core for consistent spacing.
 * NO inline styles for spacing/sizing.
 */

import * as React from 'react';
import { spacing } from '@kb-labs/studio-ui-core';

export type SpacingValue = keyof typeof spacing;

export interface BoxProps {
  /** Box content */
  children: React.ReactNode;
  /** Padding from design tokens */
  p?: SpacingValue;
  /** Padding top */
  pt?: SpacingValue;
  /** Padding right */
  pr?: SpacingValue;
  /** Padding bottom */
  pb?: SpacingValue;
  /** Padding left */
  pl?: SpacingValue;
  /** Margin from design tokens */
  m?: SpacingValue;
  /** Margin top */
  mt?: SpacingValue;
  /** Margin right */
  mr?: SpacingValue;
  /** Margin bottom */
  mb?: SpacingValue;
  /** Margin left */
  ml?: SpacingValue;
  /** HTML element to render */
  as?: keyof JSX.IntrinsicElements;
  /** Additional CSS class */
  className?: string;
  /** Additional styles (use sparingly) */
  style?: React.CSSProperties;
}

/**
 * Box component with spacing tokens
 *
 * @example
 * ```tsx
 * <Box p={4} mb={2}>Content</Box>
 * <Box pt={2} pb={3}>Asymmetric padding</Box>
 * ```
 */
export function Box({
  children,
  p,
  pt,
  pr,
  pb,
  pl,
  m,
  mt,
  mr,
  mb,
  ml,
  as: Component = 'div',
  className,
  style: customStyle,
}: BoxProps) {
  const style: React.CSSProperties = {
    ...(p !== undefined && { padding: spacing[p] }),
    ...(pt !== undefined && { paddingTop: spacing[pt] }),
    ...(pr !== undefined && { paddingRight: spacing[pr] }),
    ...(pb !== undefined && { paddingBottom: spacing[pb] }),
    ...(pl !== undefined && { paddingLeft: spacing[pl] }),
    ...(m !== undefined && { margin: spacing[m] }),
    ...(mt !== undefined && { marginTop: spacing[mt] }),
    ...(mr !== undefined && { marginRight: spacing[mr] }),
    ...(mb !== undefined && { marginBottom: spacing[mb] }),
    ...(ml !== undefined && { marginLeft: spacing[ml] }),
    ...customStyle,
  };

  return (
    <Component style={style} className={className}>
      {children}
    </Component>
  );
}
