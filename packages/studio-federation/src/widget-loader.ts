import { init, loadRemote } from '@module-federation/runtime';
import type { StudioPluginEntryV2 } from './types.js';
import type { ComponentType } from 'react';

let initialized = false;

/**
 * Initialize Module Federation runtime with discovered remotes.
 * Called once after registry is fetched.
 */
export function initFederation(plugins: StudioPluginEntryV2[]): void {
  if (initialized) return;

  init({
    name: 'studioHost',
    remotes: plugins.map((plugin) => ({
      name: plugin.remoteName,
      entry: plugin.remoteEntryUrl,
    })),
  });

  initialized = true;
}

/**
 * Reset federation state. For testing only.
 */
export function resetFederation(): void {
  initialized = false;
}

/**
 * Error thrown when a remote widget fails to load.
 */
export class PageLoadError extends Error {
  readonly remoteName: string;
  readonly exposedModule: string;

  constructor(
    message: string,
    remoteName: string,
    exposedModule: string,
    cause?: Error,
  ) {
    super(message, { cause });
    this.name = 'PageLoadError';
    this.remoteName = remoteName;
    this.exposedModule = exposedModule;
  }
}

/**
 * Load a page component from a Module Federation remote.
 * Retries on failure with backoff.
 */
export async function loadPageComponent(
  remoteName: string,
  exposedModule: string,
  retries = 2,
  retryDelay = 1000,
): Promise<{ default: ComponentType<unknown> }> {
  const modulePath = `${remoteName}/${exposedModule.replace('./', '')}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const module = await loadRemote<{ default: ComponentType<unknown> }>(modulePath);
      if (!module) throw new Error('Module resolved to null');
      return module;
    } catch (err) {
      if (attempt === retries) {
        throw new PageLoadError(
          `Failed to load page after ${retries + 1} attempts: ${modulePath}`,
          remoteName,
          exposedModule,
          err instanceof Error ? err : undefined,
        );
      }
      await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
    }
  }

  // Unreachable
  throw new PageLoadError('Unreachable', remoteName, exposedModule);
}
