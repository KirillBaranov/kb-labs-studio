/**
 * @module @kb-labs/studio-app/hooks/useWidgetData
 * Widget data hook with retry logic and diagnostics.
 */

import { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DataSource } from '@kb-labs/rest-api-contracts';
import { studioConfig } from '@/config/studio.config';
import { useRegistry } from '../providers/registry-provider';
import { createStudioLogger } from '../utils/logger';
import { useEffect } from 'react';

interface ErrorEnvelope {
  ok: false;
  error: {
    message: string;
    code?: string;
  };
}

export interface WidgetDataState<T = unknown> {
  data?: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseWidgetDataParams {
  widgetId: string;
  pluginId: string;
  source: DataSource;
  basePath?: string;
  pollingMs?: number;
  enabled?: boolean;
}

function getDefaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

function buildWidgetQueryKey(
  pluginId: string,
  widgetId: string,
  params: DataSource,
  registryVersion: string
): (string | Record<string, unknown>)[] {
  return ['widget-data', registryVersion, { pluginId, widgetId, params }];
}

async function fetchRestData(
  source: Extract<DataSource, { type: 'rest' }>,
  basePath: string,
  manifestId: string,
  signal: AbortSignal,
  traceId: string | undefined,
): Promise<unknown> {
  const { routeId, params } = source;
  const method: 'GET' | 'POST' = source.method ?? 'GET';

  const packageName = manifestId.includes('/')
    ? manifestId.split('/').pop() || manifestId
    : manifestId;

  const cleanRouteId = routeId.startsWith('/') ? routeId.slice(1) : routeId;

  let url = `${basePath}/plugins/${packageName}/${cleanRouteId}`;
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      searchParams.append(key, String(value));
    }
    url = `${url}?${searchParams.toString()}`;
  }

  const init: RequestInit = {
    method,
    headers: {
      ...getDefaultHeaders(),
    },
    signal,
  };

  if (traceId) {
    (init.headers as Record<string, string>)['X-Trace-Id'] = traceId;
  }

  if (method === 'POST') {
    const restSource = source as Extract<DataSource, { type: 'rest' }> & {
      body?: unknown;
    };
    if (restSource.body !== undefined) {
      init.body = typeof restSource.body === 'string'
        ? restSource.body
        : JSON.stringify(restSource.body);
    } else {
      init.body = JSON.stringify({});
    }
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    let errorPayload: ErrorEnvelope | null = null;
    try {
      const payload = await response.json();
      if (payload && typeof payload === 'object' && 'error' in payload) {
        errorPayload = payload as ErrorEnvelope;
      }
    } catch {
      // ignore parse errors
    }

    if (errorPayload) {
      throw new Error(errorPayload.error.message || response.statusText);
    }

    if (response.status === 404) {
      throw new Error(`Route not found: ${method} ${url}. Check plugin configuration.`);
    }

    throw new Error(response.statusText || `HTTP ${response.status}`);
  }

  const data = await response.json();

  let unwrapped = data;
  let depth = 0;
  const maxDepth = 5;

  while (depth < maxDepth && unwrapped && typeof unwrapped === 'object') {
    if ('status' in unwrapped && unwrapped.status === 'ok' && 'data' in unwrapped) {
      unwrapped = (unwrapped as any).data;
      depth++;
      continue;
    }

    if ('ok' in unwrapped && unwrapped.ok === true && 'data' in unwrapped) {
      unwrapped = (unwrapped as any).data;
      depth++;
      continue;
    }

    break;
  }

  return unwrapped;
}

async function fetchMockData(
  source: Extract<DataSource, { type: 'mock' }>,
  signal: AbortSignal
): Promise<unknown> {
  const response = await fetch(`/fixtures/${source.fixtureId}.json`, { signal });
  if (!response.ok) {
    throw new Error(`Fixture ${source.fixtureId} not found`);
  }
  return response.json();
}

function generateTraceId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

function computeWidgetRetryDelay(attemptIndex: number): number | null {
  if (attemptIndex >= 6) {
    return null;
  }
  const baseDelay = 200;
  const maxDelay = 8_000;
  const exponential = Math.min(baseDelay * 2 ** attemptIndex, maxDelay);
  const jitter = Math.random() * exponential * 0.3;
  return exponential + jitter;
}

interface QueryFactoryParams {
  source: DataSource;
  basePath: string;
  manifestId: string;
  traceId: string;
}

function createQueryFn({
  source,
  basePath,
  manifestId,
  traceId,
}: QueryFactoryParams): (ctx: { signal: AbortSignal }) => Promise<unknown> {
  if (source.type === 'rest') {
    return ({ signal }) =>
      fetchRestData(source, basePath, manifestId, signal, traceId);
  }

  if (source.type === 'mock') {
    return ({ signal }) => fetchMockData(source, signal);
  }

  if (source.type === 'static') {
    const staticSource = source as Extract<DataSource, { type: 'static' }>;
    return async () => staticSource.value ?? null;
  }

  throw new Error('Unsupported data source type');
}

export function useWidgetData<T = unknown>({
  widgetId,
  pluginId,
  source,
  basePath,
  pollingMs = 0,
  enabled = true,
}: UseWidgetDataParams): WidgetDataState<T> {
  const { registry } = useRegistry();
  const routeId =
    source.type === 'rest'
      ? source.routeId
      : source.type === 'mock'
      ? source.fixtureId
      : source.type === 'static'
      ? 'static'
      : 'unknown';

  const traceIdRef = useRef<string>(
    generateTraceId(`widget-${pluginId}-${widgetId}-${routeId}`)
  );

  const logger = useMemo(
    () =>
      createStudioLogger('useWidgetData', {
        widgetId,
        pluginId,
        routeId,
        traceId: traceIdRef.current,
      }),
    [widgetId, pluginId, routeId]
  );

  const resolvedBasePath = useMemo(() => {
    if (basePath && basePath.length > 0) {
      return basePath.endsWith('/v1') ? basePath : `${basePath.replace(/\/$/, '')}/v1`;
    }
    const configBase = studioConfig.apiBaseUrl || '/api/v1';
    return configBase.endsWith('/v1')
      ? configBase
      : `${configBase.replace(/\/$/, '')}/v1`;
  }, [basePath]);

  const queryKey = useMemo(
    () =>
      buildWidgetQueryKey(
        pluginId,
        widgetId,
        source,
        registry.generatedAt ?? '0'
      ),
    [pluginId, widgetId, source, registry.generatedAt]
  );

  const queryFn = useMemo(
    () =>
      createQueryFn({
        source,
        basePath: resolvedBasePath,
        manifestId: pluginId,
        traceId: traceIdRef.current,
      }),
    [source, resolvedBasePath, pluginId]
  );

  // Don't auto-fetch POST requests without explicit body (they should use mutations)
  const isPostWithoutBody = source.type === 'rest'
    && source.method === 'POST'
    && !('body' in source && source.body !== undefined);

  const effectiveEnabled = enabled && !isPostWithoutBody;

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
    failureCount,
  } = useQuery({
    queryKey,
    queryFn,
    enabled: effectiveEnabled,
    staleTime: 5_000,
    gcTime: 60_000,
    refetchInterval: pollingMs > 0 ? pollingMs : undefined,
    retry: attempt => computeWidgetRetryDelay(attempt - 1) !== null,
    retryDelay: attempt => {
      const delay = computeWidgetRetryDelay(attempt - 1);
      if (delay !== null) {
        logger.warn('Retrying widget fetch', {
          attempt,
          delay,
          widgetId,
          pluginId,
          traceId: traceIdRef.current,
        });
        return delay;
      }
      return 0;
    },
    throwOnError: false,
  });

  const lastStatusRef = useRef<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (error instanceof Error) {
      if (lastStatusRef.current !== 'error') {
        lastStatusRef.current = 'error';
        const code = (error as Error & { code?: string }).code;
        logger.error('Widget fetch failed', {
          widgetId,
          pluginId,
          routeId,
          retries: failureCount,
          lastErrorCode: code,
          message: error.message,
          traceId: traceIdRef.current,
        });
      }
    }
  }, [error, failureCount, logger, widgetId, pluginId, routeId]);

  useEffect(() => {
    if (!error && data !== undefined && !isFetching) {
      if (lastStatusRef.current !== 'success') {
        lastStatusRef.current = 'success';
        logger.info('Widget fetch succeeded', {
          widgetId,
          pluginId,
          routeId,
          retries: failureCount,
          traceId: traceIdRef.current,
        });
      }
    }
  }, [data, error, failureCount, isFetching, logger, widgetId, pluginId, routeId]);

  return {
    data: data as T | undefined,
    loading: isLoading || isFetching,
    error: error instanceof Error ? error.message : null,
    refetch: async () => {
      lastStatusRef.current = 'idle';
      await refetch();
    },
  };
}
