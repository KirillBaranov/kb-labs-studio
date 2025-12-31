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

/**
 * Hook to fetch Embeddings usage statistics
 *
 * @param source - Adapters data source
 */
export function useAdaptersEmbeddingsUsage(source: AdaptersDataSource) {
  return useQuery({
    queryKey: ['adapters', 'embeddings', 'usage'],
    queryFn: () => source.getEmbeddingsUsage(),
    refetchInterval: 60000,
    staleTime: 50000,
    retry: 2,
  });
}

/**
 * Hook to fetch VectorStore usage statistics
 *
 * @param source - Adapters data source
 */
export function useAdaptersVectorStoreUsage(source: AdaptersDataSource) {
  return useQuery({
    queryKey: ['adapters', 'vectorstore', 'usage'],
    queryFn: () => source.getVectorStoreUsage(),
    refetchInterval: 60000,
    staleTime: 50000,
    retry: 2,
  });
}

/**
 * Hook to fetch Cache usage statistics
 *
 * @param source - Adapters data source
 */
export function useAdaptersCacheUsage(source: AdaptersDataSource) {
  return useQuery({
    queryKey: ['adapters', 'cache', 'usage'],
    queryFn: () => source.getCacheUsage(),
    refetchInterval: 30000, // Cache stats change faster - refresh every 30s
    staleTime: 25000,
    retry: 2,
  });
}

/**
 * Hook to fetch Storage usage statistics
 *
 * @param source - Adapters data source
 */
export function useAdaptersStorageUsage(source: AdaptersDataSource) {
  return useQuery({
    queryKey: ['adapters', 'storage', 'usage'],
    queryFn: () => source.getStorageUsage(),
    refetchInterval: 60000,
    staleTime: 50000,
    retry: 2,
  });
}
