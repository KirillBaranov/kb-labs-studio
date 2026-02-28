/**
 * @module @kb-labs/studio-data-client/hooks/use-qa
 * React Query hooks for QA data source
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QADataSource, QARunOptions, QARunCheckOptions } from '../sources/qa-source.js';

export const qaQueryKeys = {
  all: ['qa'] as const,
  summary: () => [...qaQueryKeys.all, 'summary'] as const,
  latest: () => [...qaQueryKeys.all, 'latest'] as const,
  history: (limit?: number) => [...qaQueryKeys.all, 'history', limit ?? 'all'] as const,
  trends: (window?: number) => [...qaQueryKeys.all, 'trends', window ?? 'default'] as const,
  enrichedTrends: (window?: number) => [...qaQueryKeys.all, 'trends', 'enriched', window ?? 'default'] as const,
  regressions: () => [...qaQueryKeys.all, 'regressions'] as const,
  baseline: () => [...qaQueryKeys.all, 'baseline'] as const,
  details: () => [...qaQueryKeys.all, 'details'] as const,
  baselineDiff: () => [...qaQueryKeys.all, 'baseline', 'diff'] as const,
  packageTimeline: (name: string) => [...qaQueryKeys.all, 'timeline', name] as const,
  errorGroups: () => [...qaQueryKeys.all, 'errors', 'groups'] as const,
};

export function useQASummary(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.summary(),
    queryFn: () => source.getSummary(),
    staleTime: 30_000,
  });
}

export function useQALatest(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.latest(),
    queryFn: () => source.getLatest(),
    staleTime: 30_000,
  });
}

export function useQAHistory(source: QADataSource, limit?: number) {
  return useQuery({
    queryKey: qaQueryKeys.history(limit),
    queryFn: () => source.getHistory(limit),
    staleTime: 30_000,
  });
}

export function useQATrends(source: QADataSource, window?: number) {
  return useQuery({
    queryKey: qaQueryKeys.trends(window),
    queryFn: () => source.getTrends(window),
    staleTime: 60_000,
  });
}

export function useQAEnrichedTrends(source: QADataSource, window?: number) {
  return useQuery({
    queryKey: qaQueryKeys.enrichedTrends(window),
    queryFn: () => source.getEnrichedTrends(window),
    staleTime: 60_000,
  });
}

export function useQARegressions(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.regressions(),
    queryFn: () => source.getRegressions(),
    staleTime: 30_000,
  });
}

export function useQABaseline(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.baseline(),
    queryFn: () => source.getBaseline(),
    staleTime: 120_000,
  });
}

export function useQARun(source: QADataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options?: QARunOptions) => source.runQA(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaQueryKeys.all });
    },
  });
}

export function useQADetails(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.details(),
    queryFn: () => source.getDetails(),
    staleTime: 30_000,
  });
}

export function useQARunCheck(source: QADataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (options: QARunCheckOptions) => source.runCheck(options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaQueryKeys.all });
    },
  });
}

export function useQAUpdateBaseline(source: QADataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => source.updateBaseline(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaQueryKeys.all });
    },
  });
}

export function useQABaselineDiff(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.baselineDiff(),
    queryFn: () => source.getBaselineDiff(),
    staleTime: 30_000,
  });
}

export function useQAPackageTimeline(source: QADataSource, packageName: string) {
  return useQuery({
    queryKey: qaQueryKeys.packageTimeline(packageName),
    queryFn: () => source.getPackageTimeline(packageName),
    staleTime: 60_000,
    enabled: !!packageName,
  });
}

export function useQAErrorGroups(source: QADataSource) {
  return useQuery({
    queryKey: qaQueryKeys.errorGroups(),
    queryFn: () => source.getErrorGroups(),
    staleTime: 30_000,
  });
}
