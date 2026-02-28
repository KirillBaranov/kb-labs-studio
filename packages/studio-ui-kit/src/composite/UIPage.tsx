/**
 * UIPage component - Page container with padding and max-width
 *
 * Wraps page content with consistent padding and responsive max-width.
 * NO hardcoded colors, uses Ant Design theme.
 */

import * as React from 'react';
import { theme } from 'antd';
import { UIBox } from '../primitives/UIBox';

const { useToken } = theme;

export type UIPageWidth = 'default' | 'wide' | 'full';

export interface UIPageProps {
  /** Page content */
  children: React.ReactNode;
  /** Max width mode */
  width?: UIPageWidth;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * UIPage - Page container
 *
 * @example
 * ```tsx
 * <UIPage>
 *   <UIHeader title="Dashboard" />
 *   <div>Content here</div>
 * </UIPage>
 *
 * <UIPage width="wide">
 *   <div>Wider content area</div>
 * </UIPage>
 *
 * <UIPage width="full">
 *   <div>Full width, no max-width constraint</div>
 * </UIPage>
 * ```
 */
export function UIPage({
  children,
  width = 'default',
  className,
  style: customStyle,
}: UIPageProps) {
  const { token } = useToken();

  const maxWidthMap: Record<UIPageWidth, string> = {
    default: '1280px',  // Standard desktop width
    wide: '1600px',     // Wide screens
    full: '100%',       // No constraint
  };

  const style: React.CSSProperties = {
    maxWidth: maxWidthMap[width],
    margin: '0 auto',
    padding: token.padding,
    backgroundColor: token.colorBgContainer,
    minHeight: '100vh',
    ...customStyle,
  };

  return (
    <UIBox as="main" className={className} style={style}>
      {children}
    </UIBox>
  );
}
