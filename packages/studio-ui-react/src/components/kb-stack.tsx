import * as React from 'react';
import { Space } from 'antd';
import type { SpaceProps } from 'antd';

export interface KBStackProps extends SpaceProps {
  children: React.ReactNode;
}

export function KBStack({ children, direction = 'vertical', size = 'middle', ...props }: KBStackProps) {
  return (
    <Space direction={direction} size={size} style={{ width: '100%', display: 'flex' }} {...props}>
      {children}
    </Space>
  );
}

