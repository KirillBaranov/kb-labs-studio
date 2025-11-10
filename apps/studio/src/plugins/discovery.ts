/**
 * @module @kb-labs/studio-app/plugins/discovery
 * Plugin discovery for Studio
 */

import type { ManifestV1, ManifestV2 } from '@kb-labs/plugin-manifest';
import {
  detectManifestVersion,
  checkDualManifest,
  migrateV1ToV2,
  getDeprecationWarning,
} from '@kb-labs/plugin-manifest';
import { createStudioLogger } from '../utils/logger.js';

const discoveryLogger = createStudioLogger('plugin-discovery');

type ManifestVariant = ManifestV1 | ManifestV2;
type RegistryPayload =
  | ManifestVariant
  | {
      manifest: ManifestVariant;
      packageName?: string;
      package?: string;
    };

function unwrapManifest(payload: RegistryPayload): ManifestVariant {
  if (payload && typeof payload === 'object' && 'manifest' in payload) {
    return (payload as { manifest: ManifestVariant }).manifest;
  }
  return payload as ManifestVariant;
}

function isManifestV2(manifest: ManifestVariant): manifest is ManifestV2 {
  return (manifest as ManifestV2)?.schema === 'kb.plugin/2';
}

function resolvePackageName(
  payload: RegistryPayload,
  manifest: ManifestVariant
): string {
  const manifestWithId = manifest as { id?: string };
  if (typeof manifestWithId.id === 'string' && manifestWithId.id.trim().length > 0) {
    return manifestWithId.id;
  }

  if (payload && typeof payload === 'object') {
    const candidate =
      // Support registry payloads that include packageName/package metadata
      (payload as { packageName?: string }).packageName ??
      (payload as { package?: string }).package;
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return 'unknown-plugin';
}

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
    let registryUrl: string;
    if (apiBaseUrl.startsWith('http')) {
      registryUrl = `${apiBaseUrl}/plugins/registry`;
    } else {
      registryUrl = `${apiBaseUrl}/plugins/registry`;
    }
    discoveryLogger.info('Fetching registry', { registryUrl });
    const response = await fetch(registryUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
    }
    if (response.ok) {
      const data = await response.json();
      const manifests = data.manifests || (data.data && data.data.manifests) || [];
      if (Array.isArray(manifests)) {
        for (const manifestEntry of manifests as RegistryPayload[]) {
          const manifest = unwrapManifest(manifestEntry);
          const version = detectManifestVersion(manifest);
          const packageName = resolvePackageName(manifestEntry, manifest);

          if (version === 'v2' && isManifestV2(manifest)) {
            plugins.push({
              packageName,
              version: 'v2',
              manifest,
            });
          } else if (version === 'v1') {
            plugins.push({
              packageName,
              version: 'v1',
              manifest: manifest as ManifestV1,
              warning: getDeprecationWarning(packageName),
            });
          } else {
            discoveryLogger.warn('Unknown manifest version detected', {
              packageName,
            });
          }
        }
        return plugins;
      }
    }
  } catch (e) {
    const registryUrl = apiBaseUrl.startsWith('http')
      ? `${apiBaseUrl}/plugins/registry`
      : `${apiBaseUrl}/plugins/registry`;
    discoveryLogger.warn('Failed to load registry from API endpoint', {
      error: e instanceof Error ? e.message : String(e),
      registryUrl,
    });
  }

  // 2. Try to load from static registry.json
  try {
    const response = await fetch('/registry.json');
    if (response.ok) {
      const registry = await response.json();
      if (registry.manifests && Array.isArray(registry.manifests)) {
        for (const manifestEntry of registry.manifests as RegistryPayload[]) {
          const manifest = unwrapManifest(manifestEntry);
          const version = detectManifestVersion(manifest);
          const packageName = resolvePackageName(manifestEntry, manifest);

          if (version === 'v2' && isManifestV2(manifest)) {
            plugins.push({
              packageName,
              version: 'v2',
              manifest,
            });
          } else if (version === 'v1') {
            discoveryLogger.warn('Registry manifest still on v1 schema', {
              packageName,
            });
          }
        }
        return plugins;
      }
    }
  } catch (e) {
    // Static registry not available
  }

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
        discoveryLogger.warn('Dual manifest detected', {
          warning: check.warning,
          packageName,
        });
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

