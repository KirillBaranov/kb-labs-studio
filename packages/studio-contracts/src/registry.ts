/**
 * @module @kb-labs/studio-contracts/registry
 * Studio registry for plugin widget/layout/menu aggregation.
 */

import type { StudioWidgetDecl } from './widget.js';
import type { StudioLayoutDecl, StudioMenuDecl } from './layout.js';

/**
 * Schema version identifier.
 */
export const STUDIO_SCHEMA_VERSION = 'kb.studio/1' as const;

/**
 * Numeric schema version for comparisons.
 */
export const STUDIO_SCHEMA_VERSION_NUMBER = 1;

/**
 * Plugin entry in the registry.
 */
export interface StudioPluginEntry {
  /** Plugin ID */
  pluginId: string;
  /** Plugin version */
  pluginVersion?: string;
  /** All widget declarations from this plugin */
  widgets: StudioWidgetDecl[];
  /** All layout declarations from this plugin */
  layouts: StudioLayoutDecl[];
  /** All menu declarations from this plugin */
  menus?: StudioMenuDecl[];
}

/**
 * Complete Studio registry.
 * Aggregates all plugins' studio configurations.
 */
export interface StudioRegistry {
  /** Schema version for migrations */
  schema: typeof STUDIO_SCHEMA_VERSION;
  /** Numeric version for comparison */
  schemaVersion: typeof STUDIO_SCHEMA_VERSION_NUMBER;
  /** When the registry was generated (ISO timestamp) */
  generatedAt: string;
  /** All plugin entries */
  plugins: StudioPluginEntry[];
}

/**
 * Flattened registry view (widgets/layouts/menus from all plugins).
 */
export interface FlattenedRegistry {
  /** All widgets from all plugins */
  widgets: StudioWidgetDecl[];
  /** All layouts from all plugins */
  layouts: StudioLayoutDecl[];
  /** All menus from all plugins */
  menus: StudioMenuDecl[];
  /** Widget lookup by ID */
  widgetMap: Map<string, StudioWidgetDecl>;
  /** Layout lookup by ID */
  layoutMap: Map<string, StudioLayoutDecl>;
}

/**
 * Create a new empty registry.
 */
export function createEmptyRegistry(): StudioRegistry {
  return {
    schema: STUDIO_SCHEMA_VERSION,
    schemaVersion: STUDIO_SCHEMA_VERSION_NUMBER,
    generatedAt: new Date().toISOString(),
    plugins: [],
  };
}

/**
 * Flatten a registry into a single view.
 */
export function flattenRegistry(registry: StudioRegistry): FlattenedRegistry {
  const widgets: StudioWidgetDecl[] = [];
  const layouts: StudioLayoutDecl[] = [];
  const menus: StudioMenuDecl[] = [];
  const widgetMap = new Map<string, StudioWidgetDecl>();
  const layoutMap = new Map<string, StudioLayoutDecl>();

  for (const plugin of registry.plugins) {
    for (const widget of plugin.widgets) {
      widgets.push(widget);
      widgetMap.set(widget.id, widget);
    }
    for (const layout of plugin.layouts) {
      layouts.push(layout);
      layoutMap.set(layout.id, layout);
    }
    if (plugin.menus) {
      menus.push(...plugin.menus);
    }
  }

  return { widgets, layouts, menus, widgetMap, layoutMap };
}

/**
 * Validate registry schema version.
 */
export function validateSchemaVersion(registry: StudioRegistry): boolean {
  return registry.schema === STUDIO_SCHEMA_VERSION;
}

/**
 * Check if registry needs migration.
 */
export function needsMigration(registry: StudioRegistry): boolean {
  return registry.schemaVersion < STUDIO_SCHEMA_VERSION_NUMBER;
}
