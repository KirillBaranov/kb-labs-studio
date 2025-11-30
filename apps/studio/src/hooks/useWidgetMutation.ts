/**
 * @module @kb-labs/studio-app/hooks/useWidgetMutation
 * Widget mutation hook with policy-aware header handling, retry logic, and event integration.
 */

import { useMemo, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StudioHeaderHints } from '@kb-labs/plugin-adapter-studio';
import { studioConfig } from '@/config/studio.config';
import { createStudioLogger } from '../utils/logger';
import { useWidgetEvents } from './useWidgetEvents';
import { filterHeaders } from './useWidgetData';

interface ErrorEnvelope {
  ok: false;
  error: {
    message: string;
    code?: string;
  };
}

function headerCase(name: string): string {
  return name
    .toLowerCase()
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function getDefaultHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

function generateTraceId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}

async function executeMutation<TData, TVariables>(
  variables: TVariables,
  {
    pluginId,
    routeId,
    method,
    basePath,
    headerHints,
    traceId,
    headers,
  }: {
    pluginId: string;
    routeId: string;
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    basePath: string;
    headerHints?: StudioHeaderHints;
    traceId: string;
    headers?: Record<string, string>;
  }
): Promise<TData> {
  const filtered = filterHeaders(headers, headerHints);

  if (headerHints && filtered.missingRequired.length > 0) {
    console.warn(
      `[Studio] Missing required headers for ${pluginId}:${routeId} -> ${filtered.missingRequired.join(', ')}`
    );
  }

  const packageName = pluginId.includes('/')
    ? pluginId.split('/').pop() || pluginId
    : pluginId;

  const cleanRouteId = routeId.startsWith('/') ? routeId.slice(1) : routeId;
  const url = `${basePath}/plugins/${packageName}/${cleanRouteId}`;

  const init: RequestInit = {
    method,
    headers: {
      ...getDefaultHeaders(),
      ...filtered.headers,
    },
  };

  if (traceId) {
    (init.headers as Record<string, string>)['X-Trace-Id'] = traceId;
  }

  init.body = typeof variables === 'string'
    ? variables
    : JSON.stringify(variables);

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

  // Unwrap envelope format if present
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

  return unwrapped as TData;
}

export interface UseWidgetMutationOptions<TData, TVariables> {
  /** Plugin ID (e.g., '@kb-labs/mind') */
  pluginId: string;
  /** Route ID from plugin manifest */
  routeId: string;
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Base path for REST API */
  basePath?: string;
  /** Header hints from manifest */
  headerHints?: StudioHeaderHints;
  /** Custom headers */
  headers?: Record<string, string>;
  /** Callback on successful mutation */
  onSuccess?: (data: TData, variables: TVariables) => void;
  /** Callback on error */
  onError?: (error: Error, variables: TVariables) => void;
  /** Event name to emit on success */
  emitEventOnSuccess?: string;
  /** Event payload factory */
  eventPayloadFactory?: (data: TData, variables: TVariables) => unknown;
  /** Query keys to invalidate on success */
  invalidateQueries?: string[];
}

export interface WidgetMutationState<TData, TVariables> {
  /** Execute mutation */
  mutate: (variables: TVariables) => void;
  /** Execute mutation async */
  mutateAsync: (variables: TVariables) => Promise<TData>;
  /** Mutation data */
  data: TData | undefined;
  /** Error state */
  error: Error | null;
  /** Loading state */
  isPending: boolean;
  /** Success state */
  isSuccess: boolean;
  /** Error state */
  isError: boolean;
  /** Reset mutation state */
  reset: () => void;
}

/**
 * Hook for widget mutations (POST/PUT/DELETE/PATCH requests)
 */
export function useWidgetMutation<TData = unknown, TVariables = unknown>({
  pluginId,
  routeId,
  method = 'POST',
  basePath,
  headerHints,
  headers,
  onSuccess,
  onError,
  emitEventOnSuccess,
  eventPayloadFactory,
  invalidateQueries,
}: UseWidgetMutationOptions<TData, TVariables>): WidgetMutationState<TData, TVariables> {
  const queryClient = useQueryClient();
  const { emit } = useWidgetEvents();
  
  const traceIdRef = useRef<string>(
    generateTraceId(`mutation-${pluginId}-${routeId}`)
  );

  const logger = useMemo(
    () =>
      createStudioLogger('useWidgetMutation', {
        pluginId,
        routeId,
        traceId: traceIdRef.current,
      }),
    [pluginId, routeId]
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

  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      return executeMutation<TData, TVariables>(variables, {
        pluginId,
        routeId,
        method,
        basePath: resolvedBasePath,
        headerHints,
        traceId: traceIdRef.current,
        headers,
      });
    },
    onSuccess: (data, variables) => {
      logger.info('Mutation succeeded', {
        pluginId,
        routeId,
        traceId: traceIdRef.current,
      });

      // Invalidate queries if specified
      if (invalidateQueries && invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
      }

      // Emit event if specified
      if (emitEventOnSuccess) {
        const payload = eventPayloadFactory
          ? eventPayloadFactory(data, variables)
          : { data, variables };
        emit(emitEventOnSuccess, payload);
      }

      // Call custom onSuccess
      onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      logger.error('Mutation failed', {
        pluginId,
        routeId,
        traceId: traceIdRef.current,
        error: error.message,
      });

      // Call custom onError
      onError?.(error, variables);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    error: mutation.error,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    reset: mutation.reset,
  };
}

