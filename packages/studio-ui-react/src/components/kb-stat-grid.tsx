import * as React from 'react';
import { KBGrid, KBGridItem } from './kb-grid';

export interface KBStatGridProps {
  columns?: number;
  children: React.ReactNode;
}

export function KBStatGrid({ columns = 4, children }: KBStatGridProps) {
  const span = 24 / columns;

  return (
    <KBGrid gutter={[16, 16]}>
      {React.Children.map(children, (child, index) => (
        <KBGridItem span={span} key={index}>
          {child}
        </KBGridItem>
      ))}
    </KBGrid>
  );
}

