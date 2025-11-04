/**
 * @module @kb-labs/studio-app/hooks/useWidgetData
 * Widget data hook with SWR, backoff, and race condition protection
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePolling } from './usePolling.js';
import type { DataSource } from '@kb-labs/plugin-manifest';

/**
 * Error envelope type
 */
interface ErrorEnvelope {
  ok: false;
  error: {
    message: string;
    code?: string;
  };
}

/**
 * Widget data state
 */
export interface WidgetDataState<T = unknown> {
  data?: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * SWR cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Global SWR cache
 */
const swrCache = new Map<string, CacheEntry<unknown>>();

/**
 * Allowed header prefixes for allowlist
 */
const ALLOWED_HEADER_PREFIXES = ['x-kb-'];

/**
 * Filter headers by allowlist
 */
function filterHeaders(headers?: Record<string, string>): Record<string, string> {
  if (!headers) {
    return {};
  }

  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    if (ALLOWED_HEADER_PREFIXES.some((prefix) => lowerKey.startsWith(prefix))) {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attempt: number, maxDelay: number = 30000): number {
  const baseDelay = 1000; // 1 second
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  return delay;
}

/**
 * Fetch REST data
 */
async function fetchRestData(
  source: Extract<DataSource, { type: 'rest' }>,
  basePath: string,
  manifestId: string,
  abortController: AbortController
): Promise<unknown> {
  const { routeId, method = 'GET', headers } = source;
  const filteredHeaders = filterHeaders(headers);
  
  // Use manifest.id directly (e.g., "mind") - this is what REST API expects
  // REST API path format: /api/v1/plugins/{manifestId}/{routeId}
  // Example: /api/v1/plugins/mind/query
  const url = `${basePath}/plugins/${manifestId}/${routeId}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...filteredHeaders,
    },
    signal: abortController.signal,
  };

  const response = await fetch(url, options);

  if (!response.ok) {
    let error: ErrorEnvelope | null = null;
    try {
      error = (await response.json()) as ErrorEnvelope;
    } catch {
      // Ignore parse errors
    }

    if (error && !error.ok && error.error) {
      throw new Error(error.error.message || response.statusText);
    }

    throw new Error(response.statusText);
  }

  const data = await response.json();

  // Handle envelope format
  if (data && typeof data === 'object' && 'ok' in data && data.ok === true && 'data' in data) {
    return data.data;
  }

  return data;
}

/**
 * Fetch mock data
 */
async function fetchMockData(
  source: Extract<DataSource, { type: 'mock' }>,
  abortController: AbortController
): Promise<unknown> {
  const { fixtureId } = source;
  const response = await fetch(`/fixtures/${fixtureId}.json`, {
    signal: abortController.signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load fixture: ${response.statusText}`);
  }

  const data = await response.json();

  // Handle envelope format
  if (data && typeof data === 'object' && 'ok' in data && data.ok === true && 'data' in data) {
    return data.data;
  }

  return data;
}

/**
 * Use widget data hook
 * Implements SWR (stale-while-revalidate), exponential backoff, and race condition protection
 * 
 * @param widgetId - Widget ID (e.g., "mind.query")
 * @param manifestId - Plugin manifest ID (e.g., "mind") - used for REST API path construction
 * @param dataSource - Data source configuration
 * @param pollingMs - Polling interval in milliseconds
 * @param basePath - API base path (default: "/api/v1")
 */
export function useWidgetData(
  widgetId: string,
  manifestId: string,
  dataSource: DataSource,
  pollingMs: number = 0,
  basePath: string = '/api/v1'
): WidgetDataState {
  const cacheKey = `${manifestId}:${widgetId}`;
  const [data, setData] = useState<unknown>(() => {
    // Instant return from cache (SWR)
    const cached = swrCache.get(cacheKey);
    return cached ? cached.data : undefined;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryAttemptRef = useRef(0);
  const backoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch function with backoff
  const fetchData = useCallback(
    async (isRetry: boolean = false) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);

        let result: unknown;

        if (dataSource.type === 'rest') {
          result = await fetchRestData(dataSource, basePath, manifestId, abortController);
        } else {
          result = await fetchMockData(dataSource, abortController);
        }

        // Update cache and state
        swrCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });

        setData(result);
        retryAttemptRef.current = 0; // Reset retry attempt on success
      } catch (err) {
        if (abortController.signal.aborted) {
          // Request was cancelled, ignore error
          return;
        }

        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);

        // Exponential backoff for 5xx errors or network errors
        const shouldRetry =
          isRetry &&
          (errorMessage.includes('5') || errorMessage.includes('network') || errorMessage.includes('fetch'));

        if (shouldRetry && retryAttemptRef.current < 5) {
          retryAttemptRef.current += 1;
          const delay = getBackoffDelay(retryAttemptRef.current);

          backoffTimeoutRef.current = setTimeout(() => {
            void fetchData(true);
          }, delay);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [cacheKey, dataSource, basePath, manifestId]
  );

  // Refetch function
  const refetch = useCallback(async () => {
    retryAttemptRef.current = 0; // Reset retry attempt
    await fetchData(false);
  }, [fetchData]);

  // Initial fetch
  useEffect(() => {
    // If we have cached data, return it immediately (SWR)
    const cached = swrCache.get(cacheKey);
    if (cached) {
      setData(cached.data);
      // Revalidate in background
      void fetchData(false);
    } else {
      // No cache, fetch immediately
      void fetchData(false);
    }
  }, [cacheKey, fetchData]);

  // Polling
  usePolling(refetch, pollingMs);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (backoffTimeoutRef.current) {
        clearTimeout(backoffTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
