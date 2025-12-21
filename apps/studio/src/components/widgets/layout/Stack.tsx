/**
 * @module @kb-labs/studio-app/components/widgets/layout/Stack
 * Stack widget - flexbox stack layout
 */

import * as React from 'react';
import { Divider } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { StackOptions as ContractOptions } from '@kb-labs/studio-contracts';

export interface StackOptions extends ContractOptions {}

export interface StackProps extends BaseWidgetProps<unknown, StackOptions> {
  children?: React.ReactNode;
}

export function Stack({ options, children }: StackProps) {
  const {
    direction = 'vertical',
    gap = 16,
    align = 'stretch',
    justify = 'start',
    wrap = false,
    reverse = false,
    divider = false,
    dividerStyle = 'solid',
  } = options ?? {};

  const alignMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  const justifyMap: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  const isHorizontal = direction === 'horizontal';

  const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal
      ? (reverse ? 'row-reverse' : 'row')
      : (reverse ? 'column-reverse' : 'column'),
    alignItems: alignMap[align],
    justifyContent: justifyMap[justify],
    gap: divider ? 0 : gap,
    flexWrap: wrap ? 'wrap' : 'nowrap',
  };

  // If divider is enabled, render children with dividers between them
  if (divider) {
    const childArray = React.Children.toArray(children);
    return (
      <div style={stackStyle}>
        {childArray.map((child, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <Divider
                type={isHorizontal ? 'vertical' : 'horizontal'}
                style={{
                  margin: isHorizontal ? `0 ${gap / 2}px` : `${gap / 2}px 0`,
                  borderStyle: dividerStyle,
                }}
              />
            )}
            {child}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return <div style={stackStyle}>{children}</div>;
}
