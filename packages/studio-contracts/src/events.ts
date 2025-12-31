/**
 * @module @kb-labs/studio-contracts/events
 * Widget event system definitions.
 */

/**
 * Configuration for emitting an event
 */
export interface EventEmitConfig {
  /** Event name to emit */
  name: string;
  /**
   * Payload mapping: maps widget data fields to event payload fields
   * Example: { workspace: 'value' } means payload.workspace = widgetData.value
   */
  payloadMap?: Record<string, string>;
}

/**
 * Configuration for subscribing to an event
 */
export interface EventSubscribeConfig {
  /** Event name to subscribe to */
  name: string;
  /**
   * Params mapping: maps event payload fields to REST query params
   * Example: { workspace: 'workspace' } means params.workspace = eventPayload.workspace
   */
  paramsMap?: Record<string, string>;
}

/**
 * Event bus configuration for a widget.
 */
export interface WidgetEventConfig {
  /** Events this widget can emit (simple strings for backward compat, or full config) */
  emit?: Array<string | EventEmitConfig>;
  /** Events this widget subscribes to (simple strings for backward compat, or full config) */
  subscribe?: Array<string | EventSubscribeConfig>;
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
