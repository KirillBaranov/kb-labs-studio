import { init, loadRemote } from '@module-federation/runtime';
import type { StudioPluginEntryV2 } from './types.js';
import type { ComponentType } from 'react';
import { devToolsStore, GenericChannel } from '@kb-labs/studio-devtools';
import type { MFEvent } from '@kb-labs/studio-devtools';

/** MF events channel — registered lazily on first use */
function getMFChannel(): ReturnType<typeof devToolsStore.getChannel<MFEvent>> {
  let ch = devToolsStore.getChannel<MFEvent>('mf-events');
  if (!ch) {
    ch = new GenericChannel<MFEvent>('mf-events', 'MF Events', 'ApiOutlined');
    devToolsStore.registerChannel(ch);
  }
  return ch;
}

let initialized = false;

/**
 * Initialize Module Federation runtime with discovered remotes.
 * Called once after registry is fetched.
 */
export function initFederation(plugins: StudioPluginEntryV2[]): void {
  if (initialized) { return; }

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
  const eventId = `mf-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const startedAt = Date.now();
  const ch = getMFChannel();

  ch?.push({ id: eventId, remoteName, exposedModule, status: 'loading', startedAt, attempt: 1 });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const module = await loadRemote<{ default: ComponentType<unknown> }>(modulePath);
      if (!module) { throw new Error('Module resolved to null'); }

      if (module.default === undefined) {
        // Module loaded but has no default export — e.g. `export function X()` instead of `export default`
        ch?.push({
          id: eventId,
          remoteName,
          exposedModule,
          status: 'warning',
          startedAt,
          durationMs: Date.now() - startedAt,
          attempt: attempt + 1,
          isDefaultUndefined: true,
        });
        return module;
      }

      ch?.push({
        id: eventId,
        remoteName,
        exposedModule,
        status: 'success',
        startedAt,
        durationMs: Date.now() - startedAt,
        attempt: attempt + 1,
      });
      return module;
    } catch (err) {
      if (attempt === retries) {
        ch?.push({
          id: eventId,
          remoteName,
          exposedModule,
          status: 'error',
          startedAt,
          durationMs: Date.now() - startedAt,
          attempt: attempt + 1,
          error: {
            message: err instanceof Error ? err.message : String(err),
            cause: err instanceof Error && err.cause instanceof Error
              ? err.cause.message
              : undefined,
          },
        });
        throw new PageLoadError(
          `Failed to load page after ${retries + 1} attempts: ${modulePath}`,
          remoteName,
          exposedModule,
          err instanceof Error ? err : undefined,
        );
      }
      ch?.push({
        id: eventId,
        remoteName,
        exposedModule,
        status: 'loading',
        startedAt,
        attempt: attempt + 2,
      });
      await new Promise<void>((resolve) => { setTimeout(resolve, retryDelay * (attempt + 1)); });
    }
  }

  // Unreachable
  throw new PageLoadError('Unreachable', remoteName, exposedModule);
}
