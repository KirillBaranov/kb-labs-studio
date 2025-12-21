/**
 * @module @kb-labs/studio-app/components/widgets/layout/Grid
 * Grid widget - CSS grid layout container
 */

import * as React from 'react';
import type { BaseWidgetProps } from '../types';
import type { GridOptions as ContractOptions } from '@kb-labs/studio-contracts';

export interface GridOptions extends ContractOptions {}

export interface GridProps extends BaseWidgetProps<unknown, GridOptions> {
  children?: React.ReactNode;
}

export function Grid({ options, children }: GridProps) {
  const {
    columns = 12,
    responsive,
    gap = 16,
    rowGap,
    colGap,
    alignItems = 'stretch',
    justifyItems = 'stretch',
    autoFlow = 'row',
    minChildWidth,
  } = options ?? {};

  // Build responsive column template
  const getGridTemplateColumns = () => {
    if (minChildWidth) {
      return `repeat(auto-fit, minmax(${minChildWidth}px, 1fr))`;
    }
    return `repeat(${columns}, 1fr)`;
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: getGridTemplateColumns(),
    gap: `${rowGap ?? gap}px ${colGap ?? gap}px`,
    alignItems,
    justifyItems,
    gridAutoFlow: autoFlow,
  };

  // Add responsive styles via CSS custom properties
  const responsiveStyles: React.CSSProperties = {};
  if (responsive) {
    // Note: In a real implementation, we'd use CSS media queries or a CSS-in-JS solution
    // For now, we'll use the md breakpoint as default
    if (responsive.md) {
      gridStyle.gridTemplateColumns = `repeat(${responsive.md}, 1fr)`;
    }
  }

  return (
    <div style={{ ...gridStyle, ...responsiveStyles }}>
      {children}
    </div>
  );
}
