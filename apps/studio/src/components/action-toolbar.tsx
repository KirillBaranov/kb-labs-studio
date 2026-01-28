/**
 * @module @kb-labs/studio-app/components/action-toolbar
 * Action toolbar component for displaying widget/page actions
 */

import * as React from 'react';
import { Button, Dropdown, Space, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import * as Icons from '@ant-design/icons';
import type { WidgetAction } from '@kb-labs/studio-contracts';
import { useWidgetActions } from '../hooks/useWidgetActions';
import { Modal } from 'antd';

export interface ActionToolbarProps {
  /** Actions to display */
  actions: WidgetAction[];
  /** Widget data for bodyMap */
  widgetData?: unknown;
  /** Widget ID */
  widgetId?: string;
  /** Plugin ID */
  pluginId?: string;
  /** Base path for REST API */
  basePath?: string;
  /** Custom callbacks */
  callbacks?: Record<string, (args?: Record<string, unknown>) => Promise<unknown>>;
  /** Size of buttons */
  size?: 'small' | 'middle' | 'large';
  /** Responsive: collapse to dropdown on mobile */
  responsive?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * ActionToolbar - displays actions as buttons or dropdown menu
 */
export function ActionToolbar({
  actions,
  widgetData,
  widgetId,
  pluginId,
  basePath,
  callbacks,
  size = 'middle',
  _responsive = true,
  className,
}: ActionToolbarProps): React.ReactElement {
  const { handleAction } = useWidgetActions({
    widgetId,
    pluginId,
    basePath,
    callbacks,
  });

  const [loadingActions, setLoadingActions] = React.useState<Set<string>>(new Set());

  // Filter visible actions
  const visibleActions = React.useMemo(() => {
    return actions
      .filter((action) => {
        // Boolean visibility (MVP)
        if (typeof action.visible === 'boolean') {
          return action.visible;
        }

        // JSONLogic expression (future)
        if (typeof action.visible === 'string') {
          // TODO: Implement JSONLogic evaluator when needed
          // return evaluateCondition(action.visible, widgetData);
          console.warn(`[ActionToolbar] JSONLogic not yet supported for action.visible: ${action.visible}`);
          return true; // Fail open for future compatibility
        }

        // Default: visible
        return true;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [actions]);

  const handleActionClick = React.useCallback(
    async (action: WidgetAction) => {
      // Check disabled state
      let isDisabled = false;
      if (typeof action.disabled === 'boolean') {
        isDisabled = action.disabled;
      } else if (typeof action.disabled === 'string') {
        // TODO: Implement JSONLogic evaluator when needed
        // isDisabled = evaluateCondition(action.disabled, widgetData);
        console.warn(`[ActionToolbar] JSONLogic not yet supported for action.disabled: ${action.disabled}`);
        isDisabled = false; // Fail open for future compatibility
      }

      if (isDisabled) {
        return;
      }

      // Show confirmation if needed
      if (action.confirm) {
        Modal.confirm({
          title: action.confirm.title,
          content: action.confirm.description,
          okText: action.confirm.okText || 'OK',
          cancelText: action.confirm.cancelText || 'Cancel',
          okButtonProps: action.confirm.danger
            ? { danger: true }
            : undefined,
          onOk: async () => {
            setLoadingActions((prev) => new Set(prev).add(action.id));
            try {
              await handleAction(action, widgetData);
            } finally {
              setLoadingActions((prev) => {
                const next = new Set(prev);
                next.delete(action.id);
                return next;
              });
            }
          },
        });
      } else {
        setLoadingActions((prev) => new Set(prev).add(action.id));
        try {
          await handleAction(action, widgetData);
        } finally {
          setLoadingActions((prev) => {
            const next = new Set(prev);
            next.delete(action.id);
            return next;
          });
        }
      }
    },
    [handleAction, widgetData]
  );

  // Render icon
  const renderIcon = (iconName?: string) => {
    if (!iconName) {return null;}
    const IconComponent = (Icons as Record<string, React.ComponentType<any>>)[iconName];
    if (!IconComponent) {return null;}
    return <IconComponent />;
  };

  // Render button action
  const renderButton = (action: WidgetAction) => {
    const isLoading = loadingActions.has(action.id);
    const isDisabled = action.disabled === true || isLoading;

    const button = (
      <Button
        key={action.id}
        type={action.variant === 'primary' ? 'primary' : action.variant === 'danger' ? 'primary' : 'default'}
        danger={action.variant === 'danger'}
        icon={renderIcon(action.icon)}
        loading={isLoading}
        disabled={isDisabled}
        onClick={() => handleActionClick(action)}
        size={size}
      >
        {action.label}
      </Button>
    );

    if (action.tooltip) {
      return (
        <Tooltip key={action.id} title={action.tooltip}>
          {button}
        </Tooltip>
      );
    }

    return button;
  };

  // Render dropdown action
  const renderDropdown = (action: WidgetAction) => {
    if (!action.children || action.children.length === 0) {
      return renderButton(action);
    }

    const menuItems: MenuProps['items'] = action.children.map((child) => ({
      key: child.id,
      label: child.label,
      icon: renderIcon(child.icon),
      danger: child.variant === 'danger',
      disabled: child.disabled === true,
      onClick: () => handleActionClick(child),
    }));

    return (
      <Dropdown key={action.id} menu={{ items: menuItems }} trigger={['click']}>
        <Button
          icon={renderIcon(action.icon)}
          size={size}
        >
          {action.label}
        </Button>
      </Dropdown>
    );
  };

  // Render actions
  const renderedActions = visibleActions.map((action) => {
    if (action.type === 'dropdown' || action.children) {
      return renderDropdown(action);
    }
    return renderButton(action);
  });

  if (renderedActions.length === 0) {
    return null;
  }

  return (
    <Space className={className} size="small" wrap>
      {renderedActions}
    </Space>
  );
}

