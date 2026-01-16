/**
 * React Query hooks for Quality data
 * Provides caching and automatic refetching for quality metrics
 */

import { useQuery } from '@tanstack/react-query';
import type { QualityDataSource } from '../sources/quality-source.js';
import type { GraphMode } from '@kb-labs/quality-contracts';

/**
 * Query keys for TanStack Query cache management
 */
export const qualityQueryKeys = {
  all: ['quality'] as const,
  stats: (includeHealth?: boolean) =>
    [...qualityQueryKeys.all, 'stats', includeHealth ?? false] as const,
  health: (detailed?: boolean) =>
    [...qualityQueryKeys.all, 'health', detailed ?? false] as const,
  dependencies: () => [...qualityQueryKeys.all, 'dependencies'] as const,
  buildOrder: (packageName?: string) =>
    [...qualityQueryKeys.all, 'build-order', packageName ?? 'all'] as const,
  cycles: () => [...qualityQueryKeys.all, 'cycles'] as const,
  graph: (mode: GraphMode, packageName?: string) =>
    [...qualityQueryKeys.all, 'graph', mode, packageName ?? 'all'] as const,
};

/**
 * Get monorepo statistics
 */
export function useQualityStats(
  source: QualityDataSource,
  includeHealth?: boolean
) {
  return useQuery({
    queryKey: qualityQueryKeys.stats(includeHealth),
    queryFn: () => source.getStats(includeHealth),
    staleTime: 60000, // 1 minute - stats don't change frequently
  });
}

/**
 * Get health score and grade
 */
export function useQualityHealth(source: QualityDataSource, detailed?: boolean) {
  return useQuery({
    queryKey: qualityQueryKeys.health(detailed),
    queryFn: () => source.getHealth(detailed),
    staleTime: 30000, // 30 seconds - health can change after fixes
  });
}

/**
 * Get dependency analysis (duplicates, unused, missing)
 */
export function useQualityDependencies(source: QualityDataSource) {
  return useQuery({
    queryKey: qualityQueryKeys.dependencies(),
    queryFn: () => source.getDependencies(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Get build order for packages
 */
export function useQualityBuildOrder(
  source: QualityDataSource,
  packageName?: string
) {
  return useQuery({
    queryKey: qualityQueryKeys.buildOrder(packageName),
    queryFn: () => source.getBuildOrder(packageName),
    staleTime: 120000, // 2 minutes - build order rarely changes
  });
}

/**
 * Get circular dependencies
 */
export function useQualityCycles(source: QualityDataSource) {
  return useQuery({
    queryKey: qualityQueryKeys.cycles(),
    queryFn: () => source.getCycles(),
    staleTime: 120000, // 2 minutes
  });
}

/**
 * Get dependency graph visualization
 */
export function useQualityGraph(
  source: QualityDataSource,
  mode: GraphMode,
  packageName?: string
) {
  return useQuery({
    queryKey: qualityQueryKeys.graph(mode, packageName),
    queryFn: () => source.getGraph(mode, packageName),
    staleTime: 120000, // 2 minutes - graph structure changes rarely
  });
}

/**
 * Get stale packages that need rebuilding
 */
export function useQualityStale(source: QualityDataSource, detailed?: boolean) {
  return useQuery({
    queryKey: [...qualityQueryKeys.all, 'stale', detailed ?? false] as const,
    queryFn: () => source.getStale(detailed),
    staleTime: 10000, // 10 seconds - stale status changes frequently during development
  });
}
