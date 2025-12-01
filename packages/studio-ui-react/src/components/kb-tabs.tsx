import * as React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';

const { TabPane } = Tabs;

export interface KBTabsProps extends TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export function KBTabs({ value, onValueChange, children, ...props }: KBTabsProps) {
  return (
    <Tabs activeKey={value} onChange={onValueChange} {...props}>
      {children}
    </Tabs>
  );
}

export interface KBTabsListProps {
  children?: React.ReactNode;
}

export function KBTabsList({ children }: KBTabsListProps) {
  return null; // No-op, tabs are defined via children
}

export interface KBTabsTriggerProps {
  value: string;
  children?: React.ReactNode;
}

export interface KBTabsContentProps {
  value: string;
  children?: React.ReactNode;
}

export function KBTabsTrigger({ value, children }: KBTabsTriggerProps) {
  return null; // Used via TabPane tab prop
}

export function KBTabsContent({ value, children }: KBTabsContentProps) {
  return (
    <TabPane key={value} tab={value}>
      {children}
    </TabPane>
  );
}

