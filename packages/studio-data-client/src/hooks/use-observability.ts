/**
 * @module @kb-labs/studio-data-client/hooks/use-observability
 * React Query hooks for observability data
 */

import { useQuery } from '@tanstack/react-query';
import type { ObservabilityDataSource } from '../sources/observability-source';

/**
 * Hook to fetch State Broker statistics
 *
 * Auto-refreshes every 5 seconds to show real-time cache metrics
 */
export function useStateBrokerStats(source: ObservabilityDataSource) {
  return useQuery({
    queryKey: ['observability', 'state-broker'],
    queryFn: () => source.getStateBrokerStats(),
    refetchInterval: 5000, // Auto-refresh every 5s for real-time updates
    staleTime: 3000, // Consider data stale after 3s
    retry: 2, // Retry failed requests twice
  });
}

/**
 * Hook to fetch DevKit health snapshot
 *
 * Caches for 1 minute as DevKit health doesn't change frequently
 */
export function useDevKitHealth(source: ObservabilityDataSource) {
  return useQuery({
    queryKey: ['observability', 'devkit'],
    queryFn: () => source.getDevKitHealth(),
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes (React Query v5)
    retry: 1, // DevKit can be slow, only retry once
  });
}
