/**
 * @module @kb-labs/studio-app/components/widgets/utils/EmptyState
 * Universal empty state component (Ant Design)
 */

import * as React from 'react';
import { Empty } from 'antd';
import { KBButton } from '@kb-labs/ui-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const iconElement = React.isValidElement(icon)
    ? icon
    : icon && typeof icon === 'function'
      ? React.createElement(icon as React.ComponentType)
      : icon;

  return (
    <Empty
      image={iconElement || Empty.PRESENTED_IMAGE_SIMPLE}
      imageStyle={{ height: 60 }}
      description={
        <div>
          {title && <h3 style={{ marginBottom: 8, fontSize: 18, fontWeight: 600 }}>{title}</h3>}
          {description && <p style={{ margin: 0, color: '#666' }}>{description}</p>}
        </div>
      }
    >
      {action && <KBButton onClick={action.onClick}>{action.label}</KBButton>}
    </Empty>
  );
}

