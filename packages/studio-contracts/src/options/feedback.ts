/**
 * @module @kb-labs/studio-contracts/options/feedback
 * Options for feedback widgets (3 widgets).
 */

/**
 * Alert type/severity.
 */
export type AlertType = 'info' | 'success' | 'warning' | 'error';

/**
 * Options for `alert` widget.
 */
export interface AlertOptions {
  /** Alert type */
  type?: AlertType;
  /** Show icon */
  showIcon?: boolean;
  /** Custom icon */
  icon?: string;
  /** Closable alert */
  closable?: boolean;
  /** Banner mode (full width, no border) */
  banner?: boolean;
  /** Show action button */
  showAction?: boolean;
  /** Action button text */
  actionText?: string;
  /** Outlined variant */
  outlined?: boolean;
  /** Filled variant */
  filled?: boolean;
}

/**
 * Options for `confirm` widget.
 */
export interface ConfirmOptions {
  /** Confirm type (affects icon/color) */
  type?: 'confirm' | 'info' | 'warning' | 'danger';
  /** Custom icon */
  icon?: string;
  /** OK button text */
  okText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** OK button variant */
  okVariant?: 'primary' | 'danger';
  /** Cancel button variant */
  cancelVariant?: 'default' | 'ghost';
  /** Show cancel button */
  showCancel?: boolean;
  /** Auto close on action */
  autoClose?: boolean;
  /** Close on mask click */
  maskClosable?: boolean;
  /** Centered dialog */
  centered?: boolean;
  /** Width */
  width?: number | string;
}
