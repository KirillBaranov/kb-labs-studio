/**
 * @module @kb-labs/studio-app/plugins/discovery
 * Plugin discovery for Studio
 *
 * NOTE: This module is deprecated. Studio now uses the /studio/registry endpoint
 * which provides a pre-computed StudioRegistry. All manifest parsing, version
 * detection, and migration is handled server-side by REST API.
 *
 * This file is kept for backward compatibility but its exports are no longer
 * used by the main registry loader.
 */

import { createStudioLogger } from '../utils/logger';

const discoveryLogger = createStudioLogger('plugin-discovery');

/**
 * @deprecated Use loadRegistry() from './registry' instead.
 * Studio now fetches pre-computed registry from REST API.
 */
export interface DiscoveredPlugin {
  packageName: string;
  version: 'v1' | 'v2';
  manifest: unknown;
  warning?: string;
}

/**
 * @deprecated Use loadRegistry() from './registry' instead.
 * Plugin discovery is now handled server-side.
 */
export async function discoverPlugins(
  _apiBaseUrl: string = '/v1'
): Promise<DiscoveredPlugin[]> {
  discoveryLogger.warn(
    'discoverPlugins() is deprecated. Use loadRegistry() which fetches from /studio/registry endpoint.'
  );
  return [];
}

/**
 * @deprecated This logic is now handled server-side.
 */
export function checkDualManifests(
  plugins: DiscoveredPlugin[]
): Map<string, DiscoveredPlugin> {
  discoveryLogger.warn(
    'checkDualManifests() is deprecated. Manifest version handling is done server-side.'
  );
  const pluginMap = new Map<string, DiscoveredPlugin>();
  for (const plugin of plugins) {
    pluginMap.set(plugin.packageName, plugin);
  }
  return pluginMap;
}
