/**
 * @module @kb-labs/studio-data-client/hooks/use-adapters
 * React Query hooks for platform adapter analytics
 */

import { useQuery } from '@tanstack/react-query';
import type { AdaptersDataSource } from '../sources/adapters-source';

/**
 * Hook to fetch LLM usage statistics
 *
 * @param source - Adapters data source
 */
export function useAdaptersLLMUsage(source: AdaptersDataSource) {
  return useQuery({
    queryKey: ['adapters', 'llm', 'usage'],
    queryFn: () => source.getLLMUsage(),
    refetchInterval: 60000, // Auto-refresh every 60s (LLM stats change slower)
    staleTime: 50000,
    retry: 2,
  });
}
