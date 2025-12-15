/**
 * @module @kb-labs/studio-app/hooks/useWidgetData
 * Widget data hook with policy-aware header handling, retry logic, and diagnostics.
 */

import { useMemo, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { DataSource, StudioHeaderHints } from '@kb-labs/rest-api-contracts';
import { studioConfig } from '@/config/studio.config';
import { useRegistry } from '../providers/registry-provider';
import { createStudioLogger } from '../utils/logger';

interface ErrorEnvelope {
  ok: false;
  error: {
    message: string;
    code?: string;
  };
}

interface HeaderFilterResult {
  headers: Record<string, string>;
  missingRequired: string[];
  provided: string[];
}

export interface HeaderStatus {
  required: string[];
  optional: string[];
  autoInjected: string[];
  deny: string[];
  provided: string[];
  missingRequired: string[];
  patterns?: string[];
}

export interface WidgetDataState<T = unknown> {
  data?: T;
  loading: boolean;
  error: string | null;
  headers: HeaderStatus | null;
  refetch: () => Promise<void>;
}

export interface UseWidgetDataParams {
  widgetId: string;
  pluginId: string;
  source: DataSource;
  basePath?: string;
  pollingMs?: number;
  headerHints?: StudioHeaderHints;
  enabled?: boolean;
}

function headerCase(name: string): string {
  return name
    .toLowerCase()
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

export function filterHeaders(
  headers: Record<string, string> | undefined,
  hints?: StudioHeaderHints
): HeaderFilterResult {
  const headerConfig = studioConfig.headers ?? {
    allowedPrefixes: ['x-'],
    allowAuthorization: false,
  };

  const requiredLower = new Set<string>((hints?.required ?? []).map((h: string) => h.toLowerCase()));
  const optionalLower = new Set<string>((hints?.optional ?? []).map((h: string) => h.toLowerCase()));
  const denyLower = new Set<string>((hints?.deny ?? []).map((h: string) => h.toLowerCase()));
  const autoLower = new Set<string>((hints?.autoInjected ?? []).map((h: string) => h.toLowerCase()));
  const allowedLower = new Set<string>([...requiredLower, ...optionalLower]);
  const allowPrefixes = headerConfig.allowedPrefixes.map((prefix) => prefix.toLowerCase());

  if (!headers) {
    const missingRequired = Array.from(requiredLower)
      .filter((name) => !autoLower.has(name))
      .map(headerCase);
    return {
      headers: {},
      missingRequired,
      provided: [],
    };
  }

  const filtered: Record<string, string> = {};
  const providedLower = new Set<string>();

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    if (denyLower.has(lowerKey)) {
      console.warn(`[Studio] Dropping header "${key}" (denied by manifest policy)`);
      continue;
    }

    if (allowedLower.size > 0) {
      if (allowedLower.has(lowerKey)) {
        filtered[key] = value;
        providedLower.add(lowerKey);
        continue;
      }

      if (allowPrefixes.some((prefix) => lowerKey.startsWith(prefix))) {
        filtered[key] = value;
        providedLower.add(lowerKey);
        continue;
      }

      console.warn(`[Studio] Dropping header "${key}" (not included in manifest allow-list)`);
      continue;
    }

    if (headerConfig.allowAuthorization && lowerKey === 'authorization') {
      filtered[key] = value;
      providedLower.add(lowerKey);
      continue;
    }

    if (allowPrefixes.some((prefix) => lowerKey.startsWith(prefix))) {
      filtered[key] = value;
      providedLower.add(lowerKey);
    }
  }

  const missingRequired = Array.from(requiredLower)
    .filter((name) => !providedLower.has(name) && !autoLower.has(name))
    .map(headerCase);

  const provided = Array.from(providedLower).map(headerCase);

  return {
    headers: filtered,
    missingRequired,
    provided,
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

function getDefaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

async function fetchRestData(
  source: Extract<DataSource, { type: 'rest' }>,
  basePath: string,
  manifestId: string,
  signal: AbortSignal,
  traceId: string | undefined,
  headerHints: StudioHeaderHints | undefined,
  onHeadersFiltered?: (status: HeaderStatus) => void
): Promise<unknown> {
  const { routeId, headers } = source;
  const method: 'GET' | 'POST' = source.method ?? 'GET';
  const filtered = filterHeaders(headers, headerHints);

  if (headerHints && filtered.missingRequired.length > 0) {
    console.warn(
      `[Studio] Missing required headers for ${manifestId}:${routeId} -> ${filtered.missingRequired.join(', ')}`
    );
  }

  if (onHeadersFiltered) {
    onHeadersFiltered({
      required: headerHints?.required ?? [],
      optional: headerHints?.optional ?? [],
      autoInjected: headerHints?.autoInjected ?? [],
      deny: headerHints?.deny ?? [],
      provided: filtered.provided,
      missingRequired: filtered.missingRequired,
      patterns: headerHints?.patterns,
    });
  }

  const packageName = manifestId.includes('/')
    ? manifestId.split('/').pop() || manifestId
    : manifestId;

  const cleanRouteId = routeId.startsWith('/') ? routeId.slice(1) : routeId;
  const url = `${basePath}/plugins/${packageName}/${cleanRouteId}`;

  const init: RequestInit = {
    method,
    headers: {
      ...getDefaultHeaders(),
      ...filtered.headers,
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
  headerHints?: StudioHeaderHints;
  onHeadersFiltered?: (status: HeaderStatus) => void;
}

function createQueryFn({
  source,
  basePath,
  manifestId,
  traceId,
  headerHints,
  onHeadersFiltered,
}: QueryFactoryParams): (ctx: { signal: AbortSignal }) => Promise<unknown> {
  if (source.type === 'rest') {
    return ({ signal }) =>
      fetchRestData(
        source,
        basePath,
        manifestId,
        signal,
        traceId,
        headerHints,
        onHeadersFiltered
      );
  }

  if (source.type === 'mock') {
    return ({ signal }) => fetchMockData(source, signal);
  }

  throw new Error('Unsupported data source type');
}

export function useWidgetData<T = unknown>({
  widgetId,
  pluginId,
  source,
  basePath,
  pollingMs = 0,
  headerHints,
  enabled = true,
}: UseWidgetDataParams): WidgetDataState<T> {
  const { registry } = useRegistry();
  const routeId =
    source.type === 'rest'
      ? source.routeId
      : source.type === 'mock'
      ? source.fixtureId
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
        registry.registryVersion ?? '0'
      ),
    [pluginId, widgetId, source, registry.registryVersion]
  );

  const initialHeaderStatus = useMemo<HeaderStatus | null>(() => {
    if (!headerHints) {
      return null;
    }
    const initial = filterHeaders(undefined, headerHints);
    return {
      required: headerHints.required ?? [],
      optional: headerHints.optional ?? [],
      autoInjected: headerHints.autoInjected ?? [],
      deny: headerHints.deny ?? [],
      provided: [],
      missingRequired: initial.missingRequired,
      patterns: headerHints.patterns,
    };
  }, [headerHints]);

  const [headerStatus, setHeaderStatus] = useState<HeaderStatus | null>(initialHeaderStatus);

  useEffect(() => {
    setHeaderStatus(initialHeaderStatus);
  }, [initialHeaderStatus]);

  const queryFn = useMemo(
    () =>
      createQueryFn({
        source,
        basePath: resolvedBasePath,
        manifestId: pluginId,
        traceId: traceIdRef.current,
        headerHints,
        onHeadersFiltered: headerHints ? setHeaderStatus : undefined,
      }),
    [source, resolvedBasePath, pluginId, headerHints]
  );

  // Don't auto-fetch POST requests without explicit body (they should use mutations)
  const isPostWithoutBody = source.type === 'rest' 
    && (source.method === 'POST' || source.method === 'PUT' || source.method === 'PATCH')
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
    headers: headerStatus,
    refetch: async () => {
      lastStatusRef.current = 'idle';
      await refetch();
    },
  };
}
