import * as React from 'react';
import { Row, Col } from 'antd';
import type { RowProps, ColProps } from 'antd';

export interface KBGridProps extends RowProps {
  children: React.ReactNode;
}

export interface KBGridItemProps extends ColProps {
  children: React.ReactNode;
}

export function KBGrid({ children, gutter = [16, 16], ...props }: KBGridProps) {
  return (
    <Row gutter={gutter} {...props}>
      {children}
    </Row>
  );
}

export function KBGridItem({ children, ...props }: KBGridItemProps) {
  return <Col {...props}>{children}</Col>;
}

