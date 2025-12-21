/**
 * @module @kb-labs/studio-contracts/events
 * Widget event system definitions.
 */

/**
 * Event bus configuration for a widget.
 */
export interface WidgetEventConfig {
  /** Events this widget can emit */
  emit?: string[];
  /** Events this widget subscribes to */
  subscribe?: string[];
}

/**
 * Event payload envelope (for type safety).
 */
export interface WidgetEvent<T = unknown> {
  /** Event name */
  name: string;
  /** Source widget ID */
  sourceWidgetId: string;
  /** Event payload */
  payload: T;
  /** Timestamp */
  timestamp: number;
}

/**
 * Standard event names used across widgets.
 */
export const STANDARD_EVENTS = {
  // Form events
  FORM_SUBMITTED: 'form:submitted',
  FORM_CHANGED: 'form:changed',
  FORM_RESET: 'form:reset',

  // Table events
  TABLE_ROW_SELECTED: 'table:rowSelected',
  TABLE_ROW_CLICKED: 'table:rowClicked',
  TABLE_SORT_CHANGED: 'table:sortChanged',
  TABLE_PAGE_CHANGED: 'table:pageChanged',

  // Metric events
  METRIC_CLICKED: 'metric:clicked',

  // Modal events
  MODAL_OPENED: 'modal:opened',
  MODAL_CLOSED: 'modal:closed',

  // Tab events
  TAB_CHANGED: 'tab:changed',

  // Tree events
  TREE_NODE_SELECTED: 'tree:nodeSelected',
  TREE_NODE_EXPANDED: 'tree:nodeExpanded',

  // Generic events
  REFRESH_REQUESTED: 'refresh:requested',
  DATA_UPDATED: 'data:updated',
} as const;

export type StandardEventName = (typeof STANDARD_EVENTS)[keyof typeof STANDARD_EVENTS];
