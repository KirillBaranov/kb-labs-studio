/**
 * @module @kb-labs/studio-app/components/widget-modal
 * Modal manager for widgets
 */

import * as React from 'react';
import { Modal as AntModal } from 'antd';
import type { ModalProps } from 'antd';
import { WidgetRenderer } from './widget-renderer';
import { useWidgetEvents } from '../hooks/useWidgetEvents';

export interface WidgetModalConfig {
  modalId: string;
  widgetId?: string;
  title?: string;
  width?: number | string;
  data?: Record<string, unknown>;
  footer?: React.ReactNode;
  onClose?: () => void;
}

export interface WidgetModalProps extends Omit<ModalProps, 'open' | 'onCancel'> {
  config: WidgetModalConfig;
  open: boolean;
  onClose: () => void;
}

/**
 * WidgetModal - renders a widget inside a modal
 */
export function WidgetModal({
  config,
  open,
  onClose,
  ...modalProps
}: WidgetModalProps): React.ReactElement {
  return (
    <AntModal
      {...modalProps}
      open={open}
      onCancel={onClose}
      title={config.title}
      width={config.width || 800}
      footer={config.footer}
      destroyOnClose
    >
      {config.widgetId && config.data?.pluginId ? (
        <WidgetRenderer
          widgetId={config.widgetId}
          pluginId={config.data.pluginId as string}
        />
      ) : (
        <div>No widget configured for this modal</div>
      )}
    </AntModal>
  );
}

/**
 * Modal manager hook
 */
export function useWidgetModal() {
  const [modals, setModals] = React.useState<Map<string, WidgetModalConfig>>(new Map());
  const { subscribe } = useWidgetEvents();

  React.useEffect(() => {
    const unsubscribe = subscribe('modal:open', (payload) => {
      const config = payload as WidgetModalConfig;
      setModals((prev) => {
        const next = new Map(prev);
        next.set(config.modalId, config);
        return next;
      });
    });

    return unsubscribe;
  }, [subscribe]);

  const openModal = React.useCallback((config: WidgetModalConfig) => {
    setModals((prev) => {
      const next = new Map(prev);
      next.set(config.modalId, config);
      return next;
    });
  }, []);

  const closeModal = React.useCallback((modalId: string) => {
    setModals((prev) => {
      const next = new Map(prev);
      const config = next.get(modalId);
      if (config?.onClose) {
        config.onClose();
      }
      next.delete(modalId);
      return next;
    });
  }, []);

  const closeAllModals = React.useCallback(() => {
    setModals((prev) => {
      prev.forEach((config) => {
        if (config.onClose) {
          config.onClose();
        }
      });
      return new Map();
    });
  }, []);

  return {
    modals: Array.from(modals.values()),
    openModal,
    closeModal,
    closeAllModals,
  };
}

/**
 * Modal manager component - renders all active modals
 */
export function WidgetModalManager(): React.ReactElement {
  const { modals, closeModal } = useWidgetModal();

  return (
    <>
      {modals.map((config) => (
        <WidgetModal
          key={config.modalId}
          config={config}
          open={true}
          onClose={() => closeModal(config.modalId)}
        />
      ))}
    </>
  );
}

