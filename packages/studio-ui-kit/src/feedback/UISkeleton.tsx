/**
 * UISkeleton component - Loading skeleton
 *
 * Wraps Ant Design Skeleton with simplified API.
 * NO hardcoded colors, uses Ant Design theme.
 */

import * as React from 'react';
import { Skeleton as AntSkeleton } from 'antd';

export interface UISkeletonProps {
  /** Show loading state */
  loading?: boolean;
  /** Content to show when not loading */
  children?: React.ReactNode;
  /** Show avatar */
  avatar?: boolean;
  /** Avatar shape */
  avatarShape?: 'circle' | 'square';
  /** Number of paragraph lines */
  lines?: number;
  /** Show title */
  title?: boolean;
  /** Active animation */
  active?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * UISkeleton - Loading skeleton
 *
 * @example
 * ```tsx
 * <UISkeleton loading={isLoading}>
 *   <div>Content</div>
 * </UISkeleton>
 *
 * <UISkeleton avatar lines={3} active />
 *
 * <UISkeleton
 *   loading={isLoading}
 *   avatar
 *   avatarShape="circle"
 *   title
 *   lines={2}
 * >
 *   <ProfileCard />
 * </UISkeleton>
 * ```
 */
export function UISkeleton({
  loading = true,
  children,
  avatar,
  avatarShape = 'circle',
  lines = 3,
  title = true,
  active = true,
  className,
  style,
}: UISkeletonProps) {
  return (
    <AntSkeleton
      loading={loading}
      avatar={avatar ? { shape: avatarShape } : false}
      paragraph={{ rows: lines }}
      title={title}
      active={active}
      className={className}
      style={style}
    >
      {children}
    </AntSkeleton>
  );
}

/**
 * UISkeletonButton - Button skeleton
 */
export const UISkeletonButton = AntSkeleton.Button;

/**
 * UISkeletonInput - Input skeleton
 */
export const UISkeletonInput = AntSkeleton.Input;

/**
 * UISkeletonImage - Image skeleton
 */
export const UISkeletonImage = AntSkeleton.Image;

/**
 * UISkeletonNode - Custom node skeleton
 */
export const UISkeletonNode = AntSkeleton.Node;
