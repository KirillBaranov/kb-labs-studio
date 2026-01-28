/**
 * @module @kb-labs/studio-app/components/widgets/feedback/Alert
 * Alert widget - notification banner
 */

import * as React from 'react';
import { Alert as AntAlert, Button } from 'antd';
import type { BaseWidgetProps } from '../types';
import type {
  AlertOptions as ContractOptions,
  AlertData,
  AlertType,
} from '@kb-labs/studio-contracts';

export interface AlertOptions extends ContractOptions {}

export interface AlertProps extends BaseWidgetProps<AlertData, AlertOptions> {
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Callback when action button is clicked */
  onAction?: () => void;
}

export function Alert({ data, options, onClose, onAction }: AlertProps) {
  const {
    type: optionType = 'info',
    showIcon = true,
    icon,
    closable: optionClosable = false,
    banner = false,
    showAction = false,
    actionText: optionActionText,
    outlined = false,
    filled = false,
  } = options ?? {};

  // Merge from data and options
  const type: AlertType = data?.type ?? optionType;
  const title = data?.title;
  const message = data?.message ?? '';
  const closable = data?.closable ?? optionClosable;
  const actionText = data?.actionText ?? optionActionText;
  const actionHref = data?.actionHref;

  if (!message && !title) {
    return null;
  }

  const renderAction = () => {
    if (!showAction && !actionText) {return null;}

    const text = actionText || 'Action';

    if (actionHref) {
      return (
        <Button type="link" href={actionHref} size="small">
          {text}
        </Button>
      );
    }

    return (
      <Button type="link" onClick={onAction} size="small">
        {text}
      </Button>
    );
  };

  // Determine variant styles
  const getVariantStyles = (): React.CSSProperties => {
    if (filled) {
      const bgMap: Record<AlertType, string> = {
        info: '#e6f4ff',
        success: '#f6ffed',
        warning: '#fffbe6',
        error: '#fff2f0',
      };
      return { backgroundColor: bgMap[type] };
    }
    if (outlined) {
      return { backgroundColor: 'transparent' };
    }
    return {};
  };

  return (
    <AntAlert
      type={type}
      message={title || message}
      description={title ? message : undefined}
      showIcon={showIcon}
      icon={icon ? <span>{icon}</span> : undefined}
      closable={closable}
      onClose={onClose}
      banner={banner}
      action={renderAction()}
      style={getVariantStyles()}
    />
  );
}
