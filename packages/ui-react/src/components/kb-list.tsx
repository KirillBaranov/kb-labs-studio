import * as React from 'react';
import { List } from 'antd';
import type { ListProps } from 'antd/es/list';

export interface KBDataListProps extends Omit<ListProps<any>, 'dataSource' | 'renderItem'> {
  children: React.ReactNode;
}

export function KBDataList({ children, ...props }: KBDataListProps) {
  return (
    <List {...props}>
      {React.Children.map(children, (child, index) => (
        <List.Item key={index}>{child}</List.Item>
      ))}
    </List>
  );
}

export interface KBListItemProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function KBListItem({ title, description, action, onClick, children }: KBListItemProps) {
  return (
    <List.Item
      actions={action ? [action] : undefined}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <List.Item.Meta title={title} description={description} />
      {children}
    </List.Item>
  );
}

