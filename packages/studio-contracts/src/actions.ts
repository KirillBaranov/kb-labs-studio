/**
 * @module @kb-labs/studio-contracts/actions
 * Widget action definitions.
 */

/**
 * Action handler types (MVP: only these 3).
 */
export type ActionHandlerType = 'rest' | 'navigate' | 'emit';

/**
 * REST action handler.
 */
export interface RestActionHandler {
  type: 'rest';
  /** Route ID from manifest */
  routeId: string;
  /** HTTP method (default: POST) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Navigation action handler.
 */
export interface NavigateActionHandler {
  type: 'navigate';
  /** Target URL or layout ID */
  target: string;
}

/**
 * Event emit action handler.
 */
export interface EmitActionHandler {
  type: 'emit';
  /** Event name */
  event: string;
  /** Event payload */
  payload?: unknown;
}

/**
 * Union of action handlers.
 */
export type ActionHandler = RestActionHandler | NavigateActionHandler | EmitActionHandler;

/**
 * Confirmation dialog config.
 */
export interface ActionConfirm {
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Confirm button text (default: 'Confirm') */
  confirmLabel?: string;
  /** Cancel button text (default: 'Cancel') */
  cancelLabel?: string;
}

/**
 * Widget action (button, link, menu item).
 */
export interface WidgetAction {
  /** Unique action ID within widget */
  id: string;
  /** Display label */
  label: string;
  /** Icon (optional) */
  icon?: string;
  /** Visual variant */
  variant?: 'primary' | 'default' | 'danger';
  /** Action handler */
  handler: ActionHandler;
  /** Confirmation dialog (optional) */
  confirm?: ActionConfirm;
  /** Disabled state (MVP: boolean only) */
  disabled?: boolean;
  /** Visibility (MVP: boolean only) */
  visible?: boolean;
  /** Render order */
  order?: number;
}

/**
 * Type guard for REST action handler.
 */
export function isRestActionHandler(handler: ActionHandler): handler is RestActionHandler {
  return handler.type === 'rest';
}

/**
 * Type guard for navigate action handler.
 */
export function isNavigateActionHandler(handler: ActionHandler): handler is NavigateActionHandler {
  return handler.type === 'navigate';
}

/**
 * Type guard for emit action handler.
 */
export function isEmitActionHandler(handler: ActionHandler): handler is EmitActionHandler {
  return handler.type === 'emit';
}
