/**
 * @module @kb-labs/studio-app/plugins/registry
 * Registry loader for Studio
 *
 * Studio only knows about rest-api-contracts - all registry generation
 * is done server-side by REST API.
 */

import type { StudioRegistry, StudioRegistryResponse } from '@kb-labs/rest-api-contracts';
import { flattenRegistry } from '@kb-labs/rest-api-contracts';
import { createStudioLogger } from '../utils/logger';

const registryLogger = createStudioLogger('registry-loader');

/**
 * Load registry from REST API endpoint
 * Server handles all manifest parsing, version detection, and registry generation.
 */
export async function loadRegistry(
  apiBaseUrl: string = '/api/v1',
  token?: string,
): Promise<StudioRegistry> {
  const registryUrl = `${apiBaseUrl}/studio/registry`;

  try {
    registryLogger.info('Fetching Studio registry', { registryUrl });

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(registryUrl, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch registry: ${response.status} ${response.statusText}`);
    }

    const envelope = await response.json();

    // Handle REST API response envelope: { ok: true, data: StudioRegistry }
    const data: StudioRegistryResponse =
      envelope && typeof envelope === 'object' && 'data' in envelope
        ? envelope.data
        : envelope;

    // Validate schema
    if (data.schema !== 'kb.studio/1') {
      registryLogger.warn('Unknown registry schema', { schema: data.schema });
    }

    const flat = flattenRegistry(data);
    registryLogger.info('Registry loaded', {
      plugins: data.plugins?.length ?? 0,
      widgets: flat.widgets.length,
      menus: flat.menus.length,
      layouts: flat.layouts.length,
      schemaVersion: data.schemaVersion,
    });

    return data;
  } catch (error) {
    registryLogger.error('Failed to load registry', {
      error: error instanceof Error ? error.message : String(error),
      registryUrl,
    });

    // Return empty registry on error
    return {
      schema: 'kb.studio/1',
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      plugins: [],
    };
  }
}

/**
 * Get registry entry by widget ID
 */
export function getWidgetById(
  registry: StudioRegistry,
  widgetId: string
): ReturnType<typeof flattenRegistry>['widgets'][0] | undefined {
  const flat = flattenRegistry(registry);
  return flat.widgets.find((w) => w.id === widgetId);
}

/**
 * Get menu entries for a target path
 */
export function getMenuEntriesByTarget(
  registry: StudioRegistry,
  target: string
): ReturnType<typeof flattenRegistry>['menus'] {
  const flat = flattenRegistry(registry);
  return flat.menus.filter((m) => m.target === target);
}
