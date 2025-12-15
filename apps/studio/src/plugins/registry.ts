/**
 * @module @kb-labs/studio-app/plugins/registry
 * Registry loader for Studio
 *
 * Studio only knows about rest-api-contracts - all registry generation
 * is done server-side by REST API.
 */

import type { StudioRegistry, StudioRegistryResponse } from '@kb-labs/rest-api-contracts';
import { createStudioLogger } from '../utils/logger';

const registryLogger = createStudioLogger('registry-loader');

/**
 * Load registry from REST API endpoint
 * Server handles all manifest parsing, version detection, and registry generation.
 */
export async function loadRegistry(
  apiBaseUrl: string = '/api/v1'
): Promise<StudioRegistry> {
  const registryUrl = `${apiBaseUrl}/studio/registry`;

  try {
    registryLogger.info('Fetching Studio registry', { registryUrl });

    const response = await fetch(registryUrl);
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
    if (data.schema !== 'kb.studio-registry/1') {
      registryLogger.warn('Unknown registry schema', { schema: data.schema });
    }

    registryLogger.info('Registry loaded', {
      plugins: data.plugins?.length ?? 0,
      widgets: data.widgets?.length ?? 0,
      menus: data.menus?.length ?? 0,
      layouts: data.layouts?.length ?? 0,
      registryVersion: data.registryVersion,
    });

    return data;
  } catch (error) {
    registryLogger.error('Failed to load registry', {
      error: error instanceof Error ? error.message : String(error),
      registryUrl,
    });

    // Return empty registry on error
    return {
      schema: 'kb.studio-registry/1',
      registryVersion: '0',
      generatedAt: new Date().toISOString(),
      plugins: [],
      widgets: [],
      menus: [],
      layouts: [],
    };
  }
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

