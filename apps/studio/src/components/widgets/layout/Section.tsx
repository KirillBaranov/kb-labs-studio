/**
 * @module @kb-labs/studio-app/components/widgets/layout/Section
 * Section widget - collapsible section container
 */

import * as React from 'react';
import { Collapse, Card, Typography, Badge, Space, Divider } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import type { BaseWidgetProps } from '../types';
import type { SectionOptions as ContractOptions } from '@kb-labs/studio-contracts';

const { Title } = Typography;

export interface SectionOptions extends ContractOptions {}

export interface SectionProps extends BaseWidgetProps<unknown, SectionOptions> {
  title?: string;
  children?: React.ReactNode;
}

export function Section({ title, options, children }: SectionProps) {
  const [expanded, setExpanded] = React.useState(options?.defaultExpanded ?? true);

  const {
    collapsible = false,
    variant = 'default',
    padding = 'md',
    showDivider = false,
    icon,
    badge,
    badgeVariant = 'default',
  } = options ?? {};

  const paddingMap: Record<string, string> = {
    none: '0',
    sm: '12px',
    md: '16px',
    lg: '24px',
  };

  const badgeStatusMap: Record<string, 'default' | 'success' | 'processing' | 'error' | 'warning'> = {
    default: 'default',
    primary: 'processing',
    success: 'success',
    warning: 'warning',
    danger: 'error',
  };

  const renderHeader = () => (
    <Space>
      {icon && <span>{icon}</span>}
      <Title level={5} style={{ margin: 0 }}>{title}</Title>
      {badge && <Badge status={badgeStatusMap[badgeVariant]} text={badge} />}
    </Space>
  );

  // Collapsible variant using Collapse
  if (collapsible) {
    return (
      <Collapse
        activeKey={expanded ? ['section'] : []}
        onChange={(keys) => setExpanded(keys.includes('section'))}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        ghost={variant === 'default'}
        bordered={variant === 'bordered'}
        style={{ marginBottom: 16 }}
      >
        <Collapse.Panel
          key="section"
          header={renderHeader()}
          style={{ padding: 0 }}
        >
          <div style={{ padding: paddingMap[padding] }}>
            {children}
          </div>
        </Collapse.Panel>
      </Collapse>
    );
  }

  // Non-collapsible variants
  if (variant === 'card') {
    return (
      <Card
        title={renderHeader()}
        bodyStyle={{ padding: paddingMap[padding] }}
        style={{ marginBottom: 16 }}
      >
        {children}
      </Card>
    );
  }

  if (variant === 'bordered') {
    return (
      <div
        style={{
          border: '1px solid var(--border-primary)',
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ padding: '12px 16px', borderBottom: showDivider ? '1px solid var(--border-primary)' : 'none' }}>
          {renderHeader()}
        </div>
        <div style={{ padding: paddingMap[padding] }}>
          {children}
        </div>
      </div>
    );
  }

  // Default variant (simple)
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        {renderHeader()}
      </div>
      {showDivider && <Divider style={{ margin: '12px 0' }} />}
      <div style={{ padding: paddingMap[padding] }}>
        {children}
      </div>
    </div>
  );
}
