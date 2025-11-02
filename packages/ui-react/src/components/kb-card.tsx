import * as React from 'react';
import { Card } from 'antd';
import type { CardProps } from 'antd';

export interface KBCardProps extends CardProps {
  children?: React.ReactNode;
}

export interface KBCardHeaderProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
}

export interface KBCardTitleProps {
  children?: React.ReactNode;
}

export interface KBCardContentProps {
  children?: React.ReactNode;
}

export function KBCard({ children, title, extra, ...props }: KBCardProps) {
  return (
    <Card title={title} extra={extra} {...props}>
      {children}
    </Card>
  );
}

export function KBCardHeader({ title, description, extra }: KBCardHeaderProps) {
  return null; // Used via Card props
}

export function KBCardTitle({ children }: KBCardTitleProps) {
  return <>{children}</>;
}

export function KBCardContent({ children }: KBCardContentProps) {
  return <>{children}</>;
}

