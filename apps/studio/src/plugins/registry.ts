/**
 * @module @kb-labs/studio-app/plugins/registry
 * Registry loader for Studio
 */

import type { ManifestV2 } from '@kb-labs/plugin-manifest';
import { toRegistry, combineRegistries, type StudioRegistry } from '@kb-labs/plugin-adapter-studio';
import { discoverPlugins, checkDualManifests } from './discovery';

/**
 * Load registry from discovered plugins
 */
export async function loadRegistry(
  apiBaseUrl: string = '/v1'
): Promise<StudioRegistry> {
  // Discover plugins
  const plugins = await discoverPlugins(apiBaseUrl);
  const checked = checkDualManifests(plugins);

  // Generate registries from v2 manifests
  const registries: StudioRegistry[] = [];
  for (const plugin of checked.values()) {
    if (plugin.version === 'v2') {
      const manifest = plugin.manifest as ManifestV2;
      if (manifest.studio) {
        const registry = toRegistry(manifest);
        registries.push(registry);
      }
    }
  }

  // Combine all registries
  if (registries.length === 0) {
    return {
      registryVersion: '1',
      generatedAt: new Date().toISOString(),
      plugins: [],
      widgets: [],
      menus: [],
      layouts: [],
    };
  }

  return combineRegistries(...registries);
}

/**
 * Get registry entry by widget ID
 */
export function getWidgetById(
  registry: StudioRegistry,
  widgetId: string
): typeof registry.widgets[0] | undefined {
  return registry.widgets.find((w: typeof registry.widgets[0]) => w.id === widgetId);
}

/**
 * Get menu entries for a target path
 */
export function getMenuEntriesByTarget(
  registry: StudioRegistry,
  target: string
): typeof registry.menus {
  return registry.menus.filter((m: typeof registry.menus[0]) => m.target === target);
}

