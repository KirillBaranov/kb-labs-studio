import * as React from 'react';
import { Typography, Space } from 'antd';
import { UIBreadcrumb } from '@kb-labs/studio-ui-kit';

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

const { Title, Paragraph } = Typography;

export interface KBPageHeaderProps {
  title: string;
  description?: string;
  extra?: React.ReactNode;
  breadcrumbItems?: BreadcrumbItem[];
  children?: React.ReactNode;
  onBack?: () => void | Promise<void>;
  icon?: React.ReactNode;
}

export function KBPageHeader({
  title,
  description,
  extra,
  breadcrumbItems,
  children,
  onBack: _onBack,
  icon: _icon,
}: KBPageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <div style={{ marginBottom: 8 }}><UIBreadcrumb items={breadcrumbItems.map(i => ({ title: i.title, ...(i.href ? { href: i.href } : {}) }))} /></div>
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
