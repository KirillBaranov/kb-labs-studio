/**
 * @module @kb-labs/studio-contracts/kinds
 * Widget kind definitions for Studio widget system.
 */

/**
 * Composite widgets that can have children.
 * These are the ONLY widget kinds that support the `children` field.
 */
export type CompositeWidgetKind = 'section' | 'grid' | 'stack' | 'tabs' | 'modal';

/**
 * All 29 widget kinds organized by category.
 *
 * Categories:
 * - Display (14): metric, metric-group, table, card, cardlist, chart-*, timeline, tree, json, diff, logs
 * - Form (6): form, input, select, checkbox-group, switch, date-picker
 * - Layout (4): section, grid, stack, tabs
 * - Navigation (3): breadcrumb, stepper, menu
 * - Feedback (3): alert, modal, confirm
 */
export type StudioWidgetKind =
  // Display (14)
  | 'metric'
  | 'metric-group'
  | 'table'
  | 'card'
  | 'cardlist'
  | 'chart-line'
  | 'chart-bar'
  | 'chart-pie'
  | 'chart-area'
  | 'timeline'
  | 'tree'
  | 'json'
  | 'diff'
  | 'logs'
  // Form (6)
  | 'form'
  | 'input'
  | 'select'
  | 'checkbox-group'
  | 'switch'
  | 'date-picker'
  // Layout/Composite (4)
  | 'section'
  | 'grid'
  | 'stack'
  | 'tabs'
  // Navigation (3)
  | 'breadcrumb'
  | 'stepper'
  | 'menu'
  // Feedback (3)
  | 'alert'
  | 'modal'
  | 'confirm';

/**
 * Leaf widgets (no children allowed).
 */
export type LeafWidgetKind = Exclude<StudioWidgetKind, CompositeWidgetKind>;

/**
 * Widget category for organization.
 */
export type WidgetCategory = 'display' | 'form' | 'layout' | 'navigation' | 'feedback';

/**
 * Map widget kind to category.
 */
export const WIDGET_CATEGORIES: Record<StudioWidgetKind, WidgetCategory> = {
  // Display (14)
  'metric': 'display',
  'metric-group': 'display',
  'table': 'display',
  'card': 'display',
  'cardlist': 'display',
  'chart-line': 'display',
  'chart-bar': 'display',
  'chart-pie': 'display',
  'chart-area': 'display',
  'timeline': 'display',
  'tree': 'display',
  'json': 'display',
  'diff': 'display',
  'logs': 'display',
  // Form (6)
  'form': 'form',
  'input': 'form',
  'select': 'form',
  'checkbox-group': 'form',
  'switch': 'form',
  'date-picker': 'form',
  // Layout (4)
  'section': 'layout',
  'grid': 'layout',
  'stack': 'layout',
  'tabs': 'layout',
  // Navigation (3)
  'breadcrumb': 'navigation',
  'stepper': 'navigation',
  'menu': 'navigation',
  // Feedback (3)
  'alert': 'feedback',
  'modal': 'feedback',
  'confirm': 'feedback',
};

/**
 * List of all composite widget kinds.
 */
export const COMPOSITE_WIDGET_KINDS: CompositeWidgetKind[] = [
  'section',
  'grid',
  'stack',
  'tabs',
  'modal',
];

/**
 * Check if a widget kind is composite (can have children).
 */
export function isCompositeKind(kind: StudioWidgetKind): kind is CompositeWidgetKind {
  return COMPOSITE_WIDGET_KINDS.includes(kind as CompositeWidgetKind);
}
