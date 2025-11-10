/**
 * @module @kb-labs/studio-app/providers/registry-provider
 * Registry provider for Studio widgets
 */

import * as React from 'react';
import type { StudioRegistry } from '@kb-labs/plugin-adapter-studio';
import { loadRegistry } from '../plugins/registry.js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createStudioLogger } from '../utils/logger.js';
import { studioConfig } from '../config/studio.config';
import { Skeleton } from '../components/widgets/utils/Skeleton.js';
import { ErrorState } from '../components/widgets/utils/ErrorState.js';

interface RegistryContextValue {
  registry: StudioRegistry;
  loading: boolean;
  error: Error | null;
  retrying: boolean;
  hasData: boolean;
  refresh: () => Promise<void>;
  health: {
    status: string;
    ready: boolean;
    reason?: string;
    registryPartial?: boolean;
    registryStale?: boolean;
    registryLoaded?: boolean;
    ts?: string;
    pluginsMounted?: number;
    pluginsFailed?: number;
    pluginMountInProgress?: boolean;
    pluginRoutesMounted?: boolean;
    lastPluginMountTs?: string | null;
    pluginRoutesLastDurationMs?: number | null;
    redisEnabled?: boolean;
    redisHealthy?: boolean;
    redisStates?: {
      publisher?: string | null;
      subscriber?: string | null;
      cache?: string | null;
    };
  } | null;
  registryMeta: {
    rev: number | null;
    generatedAt: string | null;
    partial: boolean;
    stale: boolean;
    expiresAt: string | null;
    ttlMs: number | null;
    checksum: string | null;
    checksumAlgorithm: string | null;
    previousChecksum: string | null;
  };
}

export const REGISTRY_QUERY_KEY = ['registry'];

function computeRetryDelay(attemptIndex: number): number | false {
  const configured = studioConfig.events.retryDelays;
  if (configured && configured.length > 0) {
    const value = configured[Math.min(attemptIndex, configured.length - 1)];
    return typeof value === 'number' ? value : false;
  }
  const baseDelay = 250;
  const maxDelay = 15_000;
  const exponential = Math.min(baseDelay * 2 ** attemptIndex, maxDelay);
  const jitter = Math.random() * exponential * 0.3;
  return exponential + jitter;
}

function hasData(registry?: StudioRegistry): boolean {
  return Boolean(registry && registry.plugins && registry.plugins.length > 0);
}

function buildEventsUrl(baseUrl: string): string {
  const base = baseUrl ? (baseUrl.endsWith('/') ? `${baseUrl}events/registry` : `${baseUrl}/events/registry`) : studioConfig.events.registryUrl;
  const token = studioConfig.events.token;
  if (!token) {
    return base;
  }
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}access_token=${encodeURIComponent(token)}`;
}

const RegistryContext = React.createContext<RegistryContextValue | null>(null);

/**
 * Registry provider
 */
export function RegistryProvider({
  children,
  apiBaseUrl = '/v1',
}: {
  children: React.ReactNode;
  apiBaseUrl?: string;
}): React.ReactElement {
  const logger = React.useMemo(() => createStudioLogger('registry-provider'), []);
  const queryClient = useQueryClient();
  const lastRegistryRev = React.useRef<number | null>(null);
  const lastHealthTs = React.useRef<string | null>(null);
  const [healthState, setHealthState] = React.useState<RegistryContextValue['health']>(null);
  const [registryMeta, setRegistryMeta] = React.useState<RegistryContextValue['registryMeta']>({
    rev: null,
    generatedAt: null,
    partial: false,
    stale: false,
    expiresAt: null,
    ttlMs: null,
    checksum: null,
    checksumAlgorithm: null,
    previousChecksum: null,
  });

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    failureCount,
  } = useQuery({
    queryKey: [...REGISTRY_QUERY_KEY, apiBaseUrl],
    queryFn: () => loadRegistry(apiBaseUrl),
    staleTime: 5_000,
    gcTime: 60_000,
    retry: (failureCount, _error) => computeRetryDelay(failureCount) !== false,
    retryDelay: attempt => {
      const delay = computeRetryDelay(attempt - 1);
      if (delay !== false) {
        logger.warn('Retrying registry fetch', { attempt, delay });
        return delay;
      }
      return 0;
    },
    throwOnError: false,
  });

  React.useEffect(() => {
    if (error) {
      logger.error('Failed to load registry', error);
    }
  }, [error, logger]);

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (studioConfig.events.headers && Object.keys(studioConfig.events.headers).length > 0) {
      logger.warn('Custom SSE headers are not supported by native EventSource; configure via reverse proxy instead.', {
        headerKeys: Object.keys(studioConfig.events.headers),
      });
    }

    const eventsUrl = buildEventsUrl(apiBaseUrl);
    logger.info('Connecting to registry event stream', { eventsUrl });

    const eventSource = new EventSource(eventsUrl);

    const handleOpen = () => {
      logger.info('Registry SSE connected', { eventsUrl });
    };

    const handleRegistry = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data ?? '{}') as {
          rev?: number;
          generatedAt?: string;
          partial?: boolean;
          stale?: boolean;
          expiresAt?: string | null;
          ttlMs?: number | null;
          checksum?: string;
          checksumAlgorithm?: string;
          previousChecksum?: string | null;
        };
        if (typeof payload.rev === 'number') {
          if (lastRegistryRev.current === payload.rev) {
            return;
          }
          lastRegistryRev.current = payload.rev;
        }
        setRegistryMeta(prev => ({
          rev: typeof payload.rev === 'number' ? payload.rev : prev.rev,
          generatedAt: typeof payload.generatedAt === 'string' ? payload.generatedAt : prev.generatedAt,
          partial: typeof payload.partial === 'boolean' ? payload.partial : prev.partial,
          stale: typeof payload.stale === 'boolean' ? payload.stale : prev.stale,
          expiresAt: payload.expiresAt ?? prev.expiresAt,
          ttlMs: typeof payload.ttlMs === 'number' ? payload.ttlMs : prev.ttlMs,
          checksum: payload.checksum ?? prev.checksum,
          checksumAlgorithm: payload.checksumAlgorithm ?? prev.checksumAlgorithm,
          previousChecksum: payload.previousChecksum ?? prev.previousChecksum,
        }));
      } catch (parseError) {
        logger.warn('Failed to parse registry event payload', {
          error: parseError instanceof Error ? parseError.message : String(parseError),
          data: event.data,
        });
      }

      logger.info('Registry change detected, invalidating cache');
      queryClient.invalidateQueries({ queryKey: [...REGISTRY_QUERY_KEY, apiBaseUrl] }).catch(err => {
        logger.warn('Failed to invalidate registry query', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
    };

    const handleHealth = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data ?? '{}') as {
          status?: string;
          ready?: boolean;
          reason?: string;
          registryPartial?: boolean;
          registryStale?: boolean;
          registryLoaded?: boolean;
          ts?: string;
          pluginsMounted?: number;
          pluginsFailed?: number;
          pluginMountInProgress?: boolean;
          pluginRoutesMounted?: boolean;
          lastPluginMountTs?: string | null;
          pluginRoutesLastDurationMs?: number | null;
          redisEnabled?: boolean;
          redisHealthy?: boolean;
          redisStates?: {
            publisher?: string | null;
            subscriber?: string | null;
            cache?: string | null;
          };
        };
        const normalized: RegistryContextValue['health'] = {
          status: typeof payload.status === 'string' ? payload.status : 'unknown',
          ready: Boolean(payload.ready),
          reason: payload.reason,
          registryPartial: payload.registryPartial,
          registryStale: payload.registryStale,
          registryLoaded: payload.registryLoaded,
          ts: payload.ts,
          pluginsMounted: typeof payload.pluginsMounted === 'number' ? payload.pluginsMounted : undefined,
          pluginsFailed: typeof payload.pluginsFailed === 'number' ? payload.pluginsFailed : undefined,
          pluginMountInProgress: payload.pluginMountInProgress,
          pluginRoutesMounted: payload.pluginRoutesMounted,
          lastPluginMountTs: payload.lastPluginMountTs ?? null,
          pluginRoutesLastDurationMs: payload.pluginRoutesLastDurationMs ?? null,
          redisEnabled: payload.redisEnabled,
          redisHealthy: payload.redisHealthy,
          redisStates: payload.redisStates ?? undefined,
        };
        const ts = normalized.ts ?? null;
        if (ts && lastHealthTs.current === ts) {
          return;
        }
        lastHealthTs.current = ts;
        setHealthState(normalized);
        if (!normalized.ready || normalized.status === 'degraded') {
          logger.info('Health event indicates degraded/unready state', normalized);
        }
      } catch (error) {
        logger.debug('Health event received but failed to decode', {
          err: error instanceof Error ? error.message : String(error),
        });
      }
    };

    const handleError = (event: Event) => {
      logger.warn('Registry event stream error', { type: event.type });
      if (studioConfig.events.retryDelays?.length) {
        // rely on browser reconnects; log for visibility
      }
    };

    eventSource.addEventListener('open', handleOpen);
    const registryListener: EventListener = event => {
      handleRegistry(event as MessageEvent<string>);
    };

    const healthListener: EventListener = event => {
      handleHealth(event as MessageEvent<string>);
    };

    eventSource.addEventListener('registry', registryListener);
    eventSource.addEventListener('health', healthListener);
    eventSource.addEventListener('error', handleError);

    return () => {
      logger.info('Closing registry event stream');
      eventSource.removeEventListener('open', handleOpen);
      eventSource.removeEventListener('registry', registryListener);
      eventSource.removeEventListener('health', healthListener);
      eventSource.removeEventListener('error', handleError);
      eventSource.close();
    };
  }, [apiBaseUrl, logger, queryClient]);

  const value: RegistryContextValue = React.useMemo(() => ({
    registry:
      data ?? {
        registryVersion: '0',
        generatedAt: new Date().toISOString(),
        plugins: [],
        widgets: [],
        menus: [],
        layouts: [],
      },
    loading: isLoading || isFetching,
    error: error instanceof Error ? error : null,
    retrying: failureCount > 0 && !hasData(data),
    hasData: hasData(data),
    refresh: async () => {
      await refetch();
    },
    health: healthState,
    registryMeta,
  }), [data, error, failureCount, healthState, isFetching, isLoading, refetch, registryMeta]);

  return (
    <RegistryContext.Provider value={value}>
      {value.loading && !value.hasData ? (
        <div className="registry-loading" style={{ padding: '2rem' }}>
          <Skeleton variant="text" rows={4} />
        </div>
      ) : value.error && !value.hasData ? (
        <div className="registry-error" style={{ padding: '2rem' }}>
          <ErrorState
            error={value.error.message}
            retryable
            hint={value.retrying ? 'Retrying with exponential backoff…' : 'Please verify that the REST API is reachable.'}
            onRetry={value.refresh}
          />
        </div>
      ) : (
        children
      )}
    </RegistryContext.Provider>
  );
}

/**
 * Hook to use registry
 */
export function useRegistry(): RegistryContextValue {
  const context = React.useContext(RegistryContext);
  if (!context) {
    throw new Error('useRegistry must be used within RegistryProvider');
  }
  return context;
}

