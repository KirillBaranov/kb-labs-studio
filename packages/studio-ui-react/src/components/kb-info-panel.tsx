import * as React from 'react';
import { Row, Col } from 'antd';
import type { RowProps } from 'antd';

export interface InfoPanelItem {
  label: string;
  value: React.ReactNode;
}

export interface KBInfoPanelProps extends Omit<RowProps, 'children'> {
  items: InfoPanelItem[];
  columns?: number;
}

export function KBInfoPanel({ items, columns = 2, ...props }: KBInfoPanelProps) {
  const span = 24 / columns;

  return (
    <Row gutter={[16, 16]} {...props}>
      {items.map((item, index) => (
        <Col span={span} key={index}>
          <div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 18, fontWeight: 500 }}>{item.value}</div>
          </div>
        </Col>
      ))}
    </Row>
  );
}

