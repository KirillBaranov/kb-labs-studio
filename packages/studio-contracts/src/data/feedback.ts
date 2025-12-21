/**
 * @module @kb-labs/studio-contracts/data/feedback
 * Data contracts for feedback widgets (3 widgets).
 */

import type { AlertType } from '../options/feedback.js';

/**
 * Data for `alert` widget.
 */
export interface AlertData {
  /** Alert type */
  type: AlertType;
  /** Alert title */
  title?: string;
  /** Alert message/description */
  message: string;
  /** Show close button */
  closable?: boolean;
  /** Action text */
  actionText?: string;
  /** Action URL or handler ID */
  actionHref?: string;
}

/**
 * Data for `modal` widget.
 * Note: Modal is composite, so data is minimal (children provide content).
 */
export interface ModalData {
  /** Modal title */
  title: string;
  /** Modal subtitle/description */
  subtitle?: string;
  /** Modal open state (controlled externally via events) */
  open?: boolean;
}

/**
 * Data for `confirm` widget.
 */
export interface ConfirmData {
  /** Confirm title */
  title: string;
  /** Confirm description/message */
  description: string;
  /** Icon type */
  icon?: 'info' | 'warning' | 'error' | 'confirm';
  /** OK button text */
  okText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Danger mode (red OK button) */
  danger?: boolean;
}
