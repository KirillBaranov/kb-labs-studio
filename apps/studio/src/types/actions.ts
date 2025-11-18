/**
 * @module @kb-labs/studio-app/types/actions
 * Action types for widgets and pages
 */

/**
 * Action handler types
 */
export type ActionHandlerType = 'rest' | 'navigate' | 'callback' | 'event' | 'modal';

/**
 * REST action handler configuration
 */
export interface RestActionHandler {
  type: 'rest';
  config: {
    routeId: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
  };
}

/**
 * Navigation action handler configuration
 */
export interface NavigateActionHandler {
  type: 'navigate';
  config: {
    path: string;
    target?: '_self' | '_blank';
  };
}

/**
 * Callback action handler configuration
 */
export interface CallbackActionHandler {
  type: 'callback';
  config: {
    callbackId: string;
    args?: Record<string, unknown>;
  };
}

/**
 * Event action handler configuration
 */
export interface EventActionHandler {
  type: 'event';
  config: {
    eventName: string;
    payload?: Record<string, unknown>;
  };
}

/**
 * Modal action handler configuration
 */
export interface ModalActionHandler {
  type: 'modal';
  config: {
    modalId: string;
    widgetId?: string;
    title?: string;
    width?: number | string;
    data?: Record<string, unknown>;
  };
}

/**
 * Action handler union type
 */
export type ActionHandler =
  | RestActionHandler
  | NavigateActionHandler
  | CallbackActionHandler
  | EventActionHandler
  | ModalActionHandler;

/**
 * Confirmation dialog configuration
 */
export interface ActionConfirmation {
  title: string;
  description: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
}

/**
 * Widget action definition
 */
export interface WidgetAction {
  /** Unique action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action type */
  type: 'button' | 'modal' | 'link' | 'dropdown' | 'custom';
  /** Icon name (from @ant-design/icons) */
  icon?: string;
  /** Button variant */
  variant?: 'primary' | 'default' | 'danger' | 'dashed' | 'link' | 'text';
  /** Action handler */
  handler?: ActionHandler;
  /** Confirmation dialog */
  confirm?: ActionConfirmation;
  /** Disabled state (boolean or JSONLogic expression) */
  disabled?: boolean | string;
  /** Visible state (boolean or JSONLogic expression) */
  visible?: boolean | string;
  /** Loading state */
  loading?: boolean;
  /** Tooltip text */
  tooltip?: string;
  /** Children actions (for dropdown) */
  children?: WidgetAction[];
  /** Order for sorting */
  order?: number;
}

/**
 * Action execution result
 */
export interface ActionExecutionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

