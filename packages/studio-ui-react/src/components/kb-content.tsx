import * as React from 'react';
import { Layout } from 'antd';

const { Content: AntContent } = Layout;

export interface KBContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function KBContent({ children, ...props }: KBContentProps) {
  return (
    <AntContent
      style={{
        margin: '16px',
        padding: 16,
        minHeight: 280,
      }}
      {...props}
    >
      {children}
    </AntContent>
  );
}

