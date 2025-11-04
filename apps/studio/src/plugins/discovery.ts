/**
 * @module @kb-labs/studio-app/plugins/discovery
 * Plugin discovery for Studio
 */

import type { ManifestV1, ManifestV2 } from '@kb-labs/plugin-manifest';
import {
  detectManifestVersion,
  checkDualManifest,
  migrateV1ToV2,
} from '@kb-labs/plugin-manifest';
import { getDeprecationWarning } from '@kb-labs/plugin-manifest';

/**
 * Discovered plugin
 */
export interface DiscoveredPlugin {
  /** Package name */
  packageName: string;
  /** Manifest version */
  version: 'v1' | 'v2';
  /** Manifest data */
  manifest: ManifestV1 | ManifestV2;
  /** Warning message if any */
  warning?: string;
}

/**
 * Discover plugins from API endpoint or static registry
 * Discovery order: API /v1/plugins/registry → static registry.json → auto-discovery
 */
export async function discoverPlugins(
  apiBaseUrl: string = '/v1'
): Promise<DiscoveredPlugin[]> {
  const plugins: DiscoveredPlugin[] = [];

  // 1. Try to load from API endpoint
  try {
    // Construct registry URL: ensure we use the correct path
    // If apiBaseUrl is absolute (http://...), append /plugins/registry
    // If apiBaseUrl is relative (/v1), we need to construct full URL or use proxy
    let registryUrl: string;
    if (apiBaseUrl.startsWith('http')) {
      // Absolute URL: http://localhost:5050/api/v1 -> http://localhost:5050/api/v1/plugins/registry
      registryUrl = `${apiBaseUrl}/plugins/registry`;
    } else {
      // Relative URL: /v1 -> /v1/plugins/registry (will be proxied by Vite)
      registryUrl = `${apiBaseUrl}/plugins/registry`;
    }
    console.log('[Plugin Discovery] Fetching registry from:', registryUrl);
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
    }
    if (response.ok) {
      const data = await response.json();
      // API may return envelope format {ok: true, data: {manifests: [...]}} or direct {manifests: [...]}
      const manifests = data.manifests || (data.data && data.data.manifests) || [];
      // API returns v2 manifests directly or in envelope
      if (Array.isArray(manifests)) {
        for (const manifest of manifests) {
          const version = detectManifestVersion(manifest);
          if (version === 'v2') {
            plugins.push({
              packageName: manifest.id,
              version: 'v2',
              manifest: manifest as ManifestV2,
            });
          } else if (version === 'v1') {
            plugins.push({
              packageName: manifest.id || 'unknown',
              version: 'v1',
              manifest: manifest as ManifestV1,
              warning: getDeprecationWarning(manifest.id || 'unknown'),
            });
          }
        }
        return plugins;
      }
    }
  } catch (e) {
    // API endpoint not available - continue to static registry
    const registryUrl = apiBaseUrl.startsWith('http') 
      ? `${apiBaseUrl}/plugins/registry`
      : `${apiBaseUrl}/plugins/registry`;
    console.warn('[Plugin Discovery] Failed to load from API endpoint:', e instanceof Error ? e.message : String(e));
    console.warn('[Plugin Discovery] Attempted URL:', registryUrl);
  }

  // 2. Try to load from static registry.json
  try {
    const response = await fetch('/registry.json');
    if (response.ok) {
      const registry = await response.json();
      if (registry.manifests && Array.isArray(registry.manifests)) {
        for (const manifest of registry.manifests) {
          const version = detectManifestVersion(manifest);
          if (version === 'v2') {
            plugins.push({
              packageName: manifest.id,
              version: 'v2',
              manifest: manifest as ManifestV2,
            });
          }
        }
        return plugins;
      }
    }
  } catch (e) {
    // Static registry not available
  }

  // 3. Auto-discovery would scan build artifacts (optional, not implemented)

  return plugins;
}

/**
 * Check for dual manifests and prefer v2
 */
export function checkDualManifests(
  plugins: DiscoveredPlugin[]
): Map<string, DiscoveredPlugin> {
  const pluginMap = new Map<string, DiscoveredPlugin>();

  // Group by package name
  const groups = new Map<string, DiscoveredPlugin[]>();
  for (const plugin of plugins) {
    if (!groups.has(plugin.packageName)) {
      groups.set(plugin.packageName, []);
    }
    groups.get(plugin.packageName)!.push(plugin);
  }

  // Prefer v2, warn about v1
  for (const [packageName, pluginList] of groups.entries()) {
    const v1Plugin = pluginList.find((p) => p.version === 'v1');
    const v2Plugin = pluginList.find((p) => p.version === 'v2');

    if (v1Plugin && v2Plugin) {
      // Both v1 and v2 exist - prefer v2, warn about v1
      const check = checkDualManifest(
        v1Plugin.manifest as ManifestV1,
        v2Plugin.manifest as ManifestV2,
        packageName
      );
      if (check.warning) {
        console.warn(check.warning);
      }
      pluginMap.set(packageName, v2Plugin);
    } else if (v2Plugin) {
      pluginMap.set(packageName, v2Plugin);
    } else if (v1Plugin) {
      // Migrate v1 to v2
      const v2Manifest = migrateV1ToV2(v1Plugin.manifest as ManifestV1);
      pluginMap.set(packageName, {
        packageName,
        version: 'v2',
        manifest: v2Manifest,
        warning: v1Plugin.warning,
      });
    }
  }

  return pluginMap;
}

