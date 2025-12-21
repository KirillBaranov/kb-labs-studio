/**
 * @module @kb-labs/studio-app/components/widgets/utils/Skeleton
 * Universal skeleton component (Ant Design)
 */

import * as React from 'react';
import { Skeleton as AntSkeleton } from 'antd';

export type SkeletonVariant = 'table' | 'card' | 'chart' | 'text' | 'default';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  rows?: number;
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

export function Skeleton({ variant = 'default', rows = 3, width, height, animated = true }: SkeletonProps) {
  if (variant === 'table') {
    return (
      <AntSkeleton
        active={animated}
        paragraph={{ rows: rows + 1 }}
        title={{ width: '40%' }}
      />
    );
  }

  if (variant === 'card') {
    return (
      <AntSkeleton
        active={animated}
        paragraph={{ rows }}
        title={{ width: '40%' }}
        avatar={false}
      />
    );
  }

  if (variant === 'chart') {
    return (
      <AntSkeleton
        active={animated}
        paragraph={false}
        title={false}
        style={{ height: height || 200, width }}
      />
    );
  }

  if (variant === 'text') {
    return (
      <AntSkeleton
        active={animated}
        paragraph={{ rows, width: [100, 100, 60] }}
        title={false}
        avatar={false}
      />
    );
  }

  // default
  return (
    <AntSkeleton
      active={animated}
      paragraph={false}
      title={false}
      style={{ width, height }}
    />
  );
}

