/**
 * @module @kb-labs/studio-app/components/widgets/feedback/Confirm
 * Confirm widget - confirmation dialog
 */

import * as React from 'react';
import { Modal, Button, Space } from 'antd';
import {
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { BaseWidgetProps } from '../types';
import type {
  ConfirmOptions as ContractOptions,
  ConfirmData,
} from '@kb-labs/studio-contracts';

export interface ConfirmOptions extends ContractOptions {}

export interface ConfirmProps extends BaseWidgetProps<ConfirmData, ConfirmOptions> {
  /** Whether dialog is open */
  open?: boolean;
  /** Callback when OK is clicked */
  onOk?: () => void;
  /** Callback when Cancel is clicked */
  onCancel?: () => void;
}

export function Confirm({ data, options, open = false, onOk, onCancel }: ConfirmProps) {
  const {
    type = 'confirm',
    icon: customIcon,
    okText: optionOkText = 'OK',
    cancelText: optionCancelText = 'Cancel',
    okVariant = 'primary',
    cancelVariant = 'default',
    showCancel = true,
    autoClose = true,
    maskClosable = true,
    centered = true,
    width = 416,
  } = options ?? {};

  // Merge from data and options
  const title = data?.title ?? 'Confirm';
  const description = data?.description ?? '';
  const danger = data?.danger ?? type === 'danger';
  const okText = data?.okText ?? optionOkText;
  const cancelText = data?.cancelText ?? optionCancelText;

  const iconMap: Record<string, React.ReactNode> = {
    info: <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 22 }} />,
    warning: <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: 22 }} />,
    error: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />,
    confirm: <QuestionCircleOutlined style={{ color: '#1677ff', fontSize: 22 }} />,
    danger: <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: 22 }} />,
  };

  const handleOk = () => {
    onOk?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const renderIcon = () => {
    if (customIcon) {
      return <span style={{ fontSize: 22, marginRight: 16 }}>{customIcon}</span>;
    }
    return <span style={{ marginRight: 16 }}>{iconMap[data?.icon ?? type]}</span>;
  };

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      closable={false}
      maskClosable={maskClosable}
      centered={centered}
      width={width}
      onCancel={handleCancel}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {renderIcon()}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            {title}
          </div>
          <div style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: 24 }}>
            {description}
          </div>
          <div style={{ textAlign: 'right' }}>
            <Space>
              {showCancel && (
                <Button
                  type={cancelVariant === 'ghost' ? 'text' : 'default'}
                  onClick={handleCancel}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                type="primary"
                danger={danger || okVariant === 'danger'}
                onClick={handleOk}
              >
                {okText}
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  );
}
