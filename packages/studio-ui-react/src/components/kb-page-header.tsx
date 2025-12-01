import * as React from 'react';
import { Typography, Space } from 'antd';
import { KBBreadcrumb, type BreadcrumbItem } from './kb-breadcrumb';

const { Title, Paragraph } = Typography;

export interface KBPageHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function KBPageHeader({
  title,
  description,
  extra,
  breadcrumbItems,
  children,
}: KBPageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <KBBreadcrumb items={breadcrumbItems} style={{ marginBottom: 8 }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space direction="vertical" size={0}>
          <Title level={3} style={{ margin: 0 }}>
            {title}
          </Title>
          {description && (
            <Paragraph style={{ margin: 0, color: '#666' }}>{description}</Paragraph>
          )}
        </Space>
        {extra && <Space>{extra}</Space>}
      </div>
      {children}
    </div>
  );
}
