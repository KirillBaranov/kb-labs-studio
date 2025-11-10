/**
 * @module @kb-labs/studio-app/registry/loader
 * Registry loader - loads registry.json from multiple locations
 */

import type { StudioRegistry } from '@kb-labs/plugin-adapter-studio';
import { createStudioLogger } from '../utils/logger.js';

const registryLogger = createStudioLogger('registry-loader');

const REGISTRY_PATHS = [
  '/registry.json',
  '/dist/studio/registry.json',
];

/**
 * Load registry from multiple locations with fallback
 */
export async function loadRegistry(): Promise<StudioRegistry | null> {
  for (const path of REGISTRY_PATHS) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const registry = await response.json();
        return registry as StudioRegistry;
      }
    } catch (e) {
      // Continue to next path
      registryLogger.warn('Failed to load registry path', {
        path,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  registryLogger.error('Failed to load registry from all paths');
  return null;
}

/**
 * Load registry synchronously (for SSR)
 */
export function loadRegistrySync(): StudioRegistry | null {
  // This would require Node.js fs module
  // For now, return null and let async loader handle it
  return null;
}


