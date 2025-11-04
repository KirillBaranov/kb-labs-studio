import * as React from 'react';
import { Empty } from 'antd';
import { KBButton } from '@kb-labs/ui-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  // Convert icon component to React element if it's a component
  const iconElement = React.isValidElement(icon)
    ? icon
    : icon && typeof icon === 'function'
    ? React.createElement(icon as React.ComponentType)
    : icon;

  return (
    <Empty
      image={iconElement}
      imageStyle={{ height: 60 }}
      description={
        <div>
          <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600 }}>{title}</h3>
          <p style={{ margin: 0, color: '#666' }}>{description}</p>
        </div>
      }
    >
      {action && <KBButton onClick={action.onClick}>{action.label}</KBButton>}
    </Empty>
  );
}

