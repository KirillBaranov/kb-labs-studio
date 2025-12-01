import * as React from 'react';
import { Skeleton } from 'antd';
import type { SkeletonProps } from 'antd';

export interface KBSkeletonProps extends SkeletonProps {
  className?: string;
}

export function KBSkeleton(props: KBSkeletonProps) {
  return <Skeleton {...props} />;
}

