/**
 * @module @kb-labs/studio-app/components/widgets/layout/Modal
 * Modal widget - dialog container
 */

import * as React from 'react';
import { Modal as AntModal, Button, Space } from 'antd';
import type { BaseWidgetProps } from '../types';
import type { ModalOptions as ContractOptions } from '@kb-labs/studio-contracts';

export interface ModalOptions extends ContractOptions {}

export interface ModalData {
  /** Modal open state */
  open?: boolean;
  /** Modal title */
  title?: string;
  /** Loading state for confirm button */
  confirmLoading?: boolean;
}

export interface ModalProps extends BaseWidgetProps<ModalData, ModalOptions> {
  children?: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
}

export function Modal({ data, options, children, onOk, onCancel }: ModalProps) {
  const {
    size = 'md',
    width,
    closable = true,
    maskClosable = true,
    keyboard = true,
    centered = false,
    showFooter = true,
    okText = 'OK',
    cancelText = 'Cancel',
    okVariant = 'primary',
    confirmLoading = false,
    mask = true,
    zIndex,
    destroyOnClose = false,
  } = options ?? {};

  const sizeWidthMap: Record<string, number | string> = {
    sm: 400,
    md: 520,
    lg: 720,
    xl: 1000,
    full: '100vw',
  };

  const modalWidth = width ?? sizeWidthMap[size];

  const footer = showFooter ? (
    <Space>
      <Button onClick={onCancel}>{cancelText}</Button>
      <Button
        type={okVariant === 'danger' ? 'primary' : 'primary'}
        danger={okVariant === 'danger'}
        onClick={onOk}
        loading={data?.confirmLoading || confirmLoading}
      >
        {okText}
      </Button>
    </Space>
  ) : null;

  return (
    <AntModal
      open={data?.open}
      title={data?.title}
      width={modalWidth}
      closable={closable}
      maskClosable={maskClosable}
      keyboard={keyboard}
      centered={centered}
      footer={footer}
      onOk={onOk}
      onCancel={onCancel}
      mask={mask}
      zIndex={zIndex}
      destroyOnClose={destroyOnClose}
      confirmLoading={data?.confirmLoading || confirmLoading}
    >
      {children}
    </AntModal>
  );
}
