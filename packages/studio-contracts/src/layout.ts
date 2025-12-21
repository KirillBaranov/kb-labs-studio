/**
 * @module @kb-labs/studio-contracts/layout
 * Layout and menu declarations for Studio pages.
 */

import type { WidgetAction } from './actions.js';
import type { VisibilityRule } from './visibility.js';

/**
 * Layout type for page organization.
 */
export type LayoutKind = 'grid' | 'stack' | 'split';

/**
 * Grid layout configuration.
 */
export interface GridLayoutConfig {
  /** Number of columns (default: 12) */
  cols?: number;
  /** Gap between items in pixels (default: 16) */
  gap?: number;
  /** Responsive column configuration */
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Stack layout configuration.
 */
export interface StackLayoutConfig {
  /** Stack direction */
  direction?: 'horizontal' | 'vertical';
  /** Gap between items in pixels */
  gap?: number;
  /** Alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

/**
 * Layout configuration union.
 */
export type LayoutConfig = GridLayoutConfig | StackLayoutConfig;

/**
 * Page layout declaration.
 * Defines the structure of a Studio page.
 */
export interface StudioLayoutDecl {
  /** Unique layout ID (e.g., 'release.dashboard') */
  id: string;
  /** Layout type */
  kind: LayoutKind;
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Page icon (for navigation) */
  icon?: string;
  /** Root widget IDs to render */
  widgets: string[];
  /** Page-level actions (toolbar) */
  actions?: WidgetAction[];
  /** Layout configuration */
  config?: LayoutConfig;
  /** RBAC visibility rules */
  visibility?: VisibilityRule;
  /** Render order in navigation */
  order?: number;
}

/**
 * Menu item declaration.
 * Defines navigation entries in the sidebar.
 */
export interface StudioMenuDecl {
  /** Unique menu ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon identifier */
  icon?: string;
  /** Target layout ID or external URL */
  target: string;
  /** Menu order (lower = higher in list) */
  order?: number;
  /** Parent menu ID for nesting */
  parentId?: string;
  /** RBAC visibility rules */
  visibility?: VisibilityRule;
  /** Badge text (e.g., 'New', '5') */
  badge?: string;
  /** Badge variant */
  badgeVariant?: 'default' | 'primary' | 'danger';
}

/**
 * Studio configuration for a plugin.
 * Contains all widgets, layouts, and menus.
 */
export interface StudioConfig {
  /** All widget declarations */
  widgets: import('./widget.js').StudioWidgetDecl[];
  /** All layout declarations */
  layouts: StudioLayoutDecl[];
  /** All menu declarations */
  menus?: StudioMenuDecl[];
}

/**
 * Type guard for grid layout config.
 */
export function isGridConfig(config: LayoutConfig): config is GridLayoutConfig {
  return 'cols' in config || 'responsive' in config;
}

/**
 * Type guard for stack layout config.
 */
export function isStackConfig(config: LayoutConfig): config is StackLayoutConfig {
  return 'direction' in config || 'align' in config;
}
