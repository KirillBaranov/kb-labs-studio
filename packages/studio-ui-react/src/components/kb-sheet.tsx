import * as React from 'react';
import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';

export interface KBSheetProps extends Omit<DrawerProps, 'open'> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface KBSheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export interface KBSheetHeaderProps {
  children?: React.ReactNode;
}

export interface KBSheetTitleProps {
  children?: React.ReactNode;
}

export interface KBSheetDescriptionProps {
  children?: React.ReactNode;
}

export function KBSheet({ open, onOpenChange, children, ...props }: KBSheetProps) {
  return (
    <Drawer open={open} onClose={() => onOpenChange?.(false)} {...props}>
      {children}
    </Drawer>
  );
}

export function KBSheetContent({ children, ...props }: KBSheetContentProps) {
  return <div {...props}>{children}</div>;
}

export function KBSheetHeader({ children }: KBSheetHeaderProps) {
  return <div style={{ marginBottom: 16 }}>{children}</div>;
}

export function KBSheetTitle({ children }: KBSheetTitleProps) {
  return <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{children}</h3>;
}

export function KBSheetDescription({ children }: KBSheetDescriptionProps) {
  return <p style={{ margin: '8px 0 0', color: '#666', fontSize: 14 }}>{children}</p>;
}

