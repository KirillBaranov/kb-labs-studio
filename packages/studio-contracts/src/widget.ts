/**
 * @module @kb-labs/studio-contracts/widget
 * Core widget declaration types with discriminated union for composite/leaf widgets.
 */

import type { CompositeWidgetKind, StudioWidgetKind } from './kinds.js';
import type { DataSource } from './data-source.js';
import type { WidgetAction } from './actions.js';
import type { WidgetEventConfig } from './events.js';
import type { VisibilityRule } from './visibility.js';

/**
 * Layout hint for grid positioning.
 */
export interface LayoutHint {
  /** Column span (1-12) */
  colSpan?: number;
  /** Row span */
  rowSpan?: number;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Priority for responsive collapse */
  priority?: number;
}

/**
 * Schema reference for data validation.
 */
export interface SchemaRef {
  /** Schema ID (e.g., 'release/plan') */
  id: string;
  /** Schema version */
  version?: string;
}

/**
 * Data configuration for a widget.
 */
export interface WidgetData {
  /** Data source definition */
  source: DataSource;
  /** Optional schema reference for validation */
  schema?: SchemaRef;
}

/**
 * Base fields shared by all widget declarations.
 */
interface BaseWidgetFields {
  /** Unique widget ID (dot-namespaced, e.g., 'release.plan.header') */
  id: string;
  /** Display title */
  title?: string;
  /** Description text */
  description?: string;
  /** Data source configuration */
  data: WidgetData;
  /** Layout hint for grid positioning */
  layoutHint?: LayoutHint;
  /** Widget actions (buttons, links) */
  actions?: WidgetAction[];
  /** Event subscriptions and emissions */
  events?: WidgetEventConfig;
  /** RBAC visibility rules */
  visibility?: VisibilityRule;
  /** Polling interval in milliseconds (0 = no polling) */
  pollingMs?: number;
  /** Render order (lower = earlier) */
  order?: number;
}

/**
 * Leaf widget declaration (no children allowed).
 * Used for: metric, table, card, chart-*, form, input, etc.
 */
export interface LeafWidgetDecl<K extends Exclude<StudioWidgetKind, CompositeWidgetKind>>
  extends BaseWidgetFields {
  kind: K;
  /** Widget-specific options */
  options?: unknown; // Will be typed per-widget in WidgetOptionsMap
  /** Children not allowed for leaf widgets */
  children?: never;
}

/**
 * Composite widget declaration (has children).
 * Used for: section, grid, stack, tabs, modal.
 */
export interface CompositeWidgetDecl<K extends CompositeWidgetKind> extends BaseWidgetFields {
  kind: K;
  /** Widget-specific options */
  options?: unknown; // Will be typed per-widget in WidgetOptionsMap
  /** Child widget IDs (REQUIRED for composite widgets) */
  children: string[];
}

/**
 * Union type for all widget declarations.
 * Discriminated by `kind` - composite widgets have `children`, leaf widgets don't.
 */
export type StudioWidgetDecl =
  | CompositeWidgetDecl<'section'>
  | CompositeWidgetDecl<'grid'>
  | CompositeWidgetDecl<'stack'>
  | CompositeWidgetDecl<'tabs'>
  | CompositeWidgetDecl<'modal'>
  | LeafWidgetDecl<'metric'>
  | LeafWidgetDecl<'metric-group'>
  | LeafWidgetDecl<'table'>
  | LeafWidgetDecl<'card'>
  | LeafWidgetDecl<'cardlist'>
  | LeafWidgetDecl<'chart-line'>
  | LeafWidgetDecl<'chart-bar'>
  | LeafWidgetDecl<'chart-pie'>
  | LeafWidgetDecl<'chart-area'>
  | LeafWidgetDecl<'timeline'>
  | LeafWidgetDecl<'tree'>
  | LeafWidgetDecl<'json'>
  | LeafWidgetDecl<'diff'>
  | LeafWidgetDecl<'logs'>
  | LeafWidgetDecl<'form'>
  | LeafWidgetDecl<'input'>
  | LeafWidgetDecl<'select'>
  | LeafWidgetDecl<'checkbox-group'>
  | LeafWidgetDecl<'switch'>
  | LeafWidgetDecl<'date-picker'>
  | LeafWidgetDecl<'breadcrumb'>
  | LeafWidgetDecl<'stepper'>
  | LeafWidgetDecl<'menu'>
  | LeafWidgetDecl<'alert'>
  | LeafWidgetDecl<'confirm'>;

/**
 * Type guard for composite widget declarations.
 */
export function isCompositeWidget(
  widget: StudioWidgetDecl
): widget is CompositeWidgetDecl<CompositeWidgetKind> {
  return (
    widget.kind === 'section' ||
    widget.kind === 'grid' ||
    widget.kind === 'stack' ||
    widget.kind === 'tabs' ||
    widget.kind === 'modal'
  );
}

/**
 * Type guard for leaf widget declarations.
 */
export function isLeafWidget(
  widget: StudioWidgetDecl
): widget is LeafWidgetDecl<Exclude<StudioWidgetKind, CompositeWidgetKind>> {
  return !isCompositeWidget(widget);
}

/**
 * Helper to get widget by kind with proper typing.
 */
export type WidgetDeclByKind<K extends StudioWidgetKind> = K extends CompositeWidgetKind
  ? CompositeWidgetDecl<K>
  : LeafWidgetDecl<Exclude<K, CompositeWidgetKind>>;
