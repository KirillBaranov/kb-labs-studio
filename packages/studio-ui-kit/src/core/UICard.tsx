/**
 * UICard component - Card container with header/footer
 *
 * Wraps Ant Design Card with additional features.
 * NO hardcoded colors, uses Ant Design theme.
 */

import * as React from 'react';
import { Card as AntCard, theme } from 'antd';
import type { CardProps as AntCardProps } from 'antd';
import { UIBox } from '../primitives/UIBox';
import { UIText } from '../primitives/UIText';

const { useToken } = theme;

export interface UICardProps extends Omit<AntCardProps, 'title'> {
  /** Card title */
  title?: string;
  /** Subtitle (below title) */
  subtitle?: string;
  /** Extra content (top-right corner) */
  extra?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Card content */
  children: React.ReactNode;
  /** Card size */
  size?: 'small' | 'default';
  /** Show border */
  bordered?: boolean;
  /** Hoverable effect */
  hoverable?: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * UICard - Container with optional header/footer
 *
 * @example
 * ```tsx
 * <UICard title="User Profile" subtitle="Last updated today">
 *   <p>Card content</p>
 * </UICard>
 *
 * <UICard
 *   title="Analytics"
 *   extra={<Button>View All</Button>}
 *   footer={<p>Last 7 days</p>}
 * >
 *   <MetricChart />
 * </UICard>
 * ```
 */
export function UICard({
  title,
  subtitle,
  extra,
  footer,
  children,
  size = 'default',
  bordered = true,
  hoverable = false,
  loading = false,
  ...rest
}: UICardProps) {
  const { token } = useToken();

  // Custom title with subtitle
  const cardTitle = (title || subtitle) ? (
    <UIBox>
      {title && <UIText size="lg" weight="semibold" as="div">{title}</UIText>}
      {subtitle && (
        <UIText size="sm" color="secondary" as="div" style={{ marginTop: token.marginXXS }}>
          {subtitle}
        </UIText>
      )}
    </UIBox>
  ) : undefined;

  return (
    <AntCard
      title={cardTitle}
      extra={extra}
      size={size}
      bordered={bordered}
      hoverable={hoverable}
      loading={loading}
      {...rest}
    >
      <UIBox>{children}</UIBox>
      {footer && (
        <UIBox mt={3} pt={3} style={{ borderTop: `1px solid ${token.colorBorder}` }}>
          {footer}
        </UIBox>
      )}
    </AntCard>
  );
}
