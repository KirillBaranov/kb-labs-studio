import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReleaseDataSource } from '../sources/release-source';
import type {
  GeneratePlanRequest,
  GenerateChangelogRequest,
  SaveChangelogRequest,
  RunReleaseRequest,
  PublishRequest,
  RollbackRequest,
  BuildRequest,
} from '@kb-labs/release-manager-contracts';

/**
 * Query keys for release-related queries
 */
export const releaseQueryKeys = {
  all: ['release'] as const,
  scopes: () => [...releaseQueryKeys.all, 'scopes'] as const,
  status: (scope: string) => [...releaseQueryKeys.all, 'status', scope] as const,
  plan: (scope: string) => [...releaseQueryKeys.all, 'plan', scope] as const,
  preview: (scope: string) => [...releaseQueryKeys.all, 'preview', scope] as const,
  verify: (scope: string) => [...releaseQueryKeys.all, 'verify', scope] as const,
  changelog: (scope: string, from?: string, to?: string) =>
    [...releaseQueryKeys.all, 'changelog', scope, from ?? 'all', to ?? 'all'] as const,
  report: () => [...releaseQueryKeys.all, 'report'] as const,
  history: () => [...releaseQueryKeys.all, 'history'] as const,
  historyReport: (scope: string, id: string) => [...releaseQueryKeys.all, 'history', scope, id, 'report'] as const,
  historyPlan: (scope: string, id: string) => [...releaseQueryKeys.all, 'history', scope, id, 'plan'] as const,
  historyChangelog: (scope: string, id: string) => [...releaseQueryKeys.all, 'history', scope, id, 'changelog'] as const,
  gitTimeline: (scope: string) => [...releaseQueryKeys.all, 'git-timeline', scope] as const,
  checklist: (scope: string) => [...releaseQueryKeys.all, 'checklist', scope] as const,
};

/**
 * Hook to get available release scopes
 */
export function useReleaseScopes(source: ReleaseDataSource) {
  return useQuery({
    queryKey: releaseQueryKeys.scopes(),
    queryFn: () => source.getScopes(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get release status for a scope
 */
export function useReleaseStatus(source: ReleaseDataSource, scope: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.status(scope),
    queryFn: () => source.getStatus(scope),
    enabled: enabled && !!scope,
    staleTime: 0, // Always refetch when scope changes
  });
}

/**
 * Hook to get release plan for a scope
 */
export function useReleasePlan(source: ReleaseDataSource, scope: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.plan(scope),
    queryFn: () => source.getPlan(scope),
    enabled: enabled && !!scope,
    staleTime: 0, // Always refetch when scope changes
  });
}

/**
 * Hook to get release preview for a scope
 */
export function useReleasePreview(source: ReleaseDataSource, scope: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.preview(scope),
    queryFn: () => source.getPreview(scope),
    enabled: enabled && !!scope,
    staleTime: 10000,
  });
}

/**
 * Hook to get verification results for a scope
 */
export function useReleaseVerify(source: ReleaseDataSource, scope: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.verify(scope),
    queryFn: () => source.getVerify(scope),
    enabled: enabled && !!scope,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get changelog for a scope
 */
export function useReleaseChangelog(
  source: ReleaseDataSource,
  scope: string,
  options?: { from?: string; to?: string },
  enabled = true
) {
  return useQuery({
    queryKey: releaseQueryKeys.changelog(scope, options?.from, options?.to),
    queryFn: () => source.getChangelog(scope, options),
    enabled: enabled && !!scope,
    staleTime: 0, // Always refetch when scope changes
  });
}

/**
 * Hook to get latest release report
 */
export function useReleaseReport(source: ReleaseDataSource, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.report(),
    queryFn: () => source.getReport(),
    enabled,
    staleTime: 30000,
  });
}

/**
 * Hook to get release history
 */
export function useReleaseHistory(source: ReleaseDataSource, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.history(),
    queryFn: () => source.getHistory(),
    enabled,
    staleTime: 30000,
  });
}

/**
 * Hook to get a specific historical release report
 */
export function useHistoryReport(source: ReleaseDataSource, scope: string, id: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.historyReport(scope, id),
    queryFn: () => source.getHistoryReport(scope, id),
    enabled: enabled && !!scope && !!id,
    staleTime: 60000, // Historical data changes rarely
  });
}

/**
 * Hook to get a specific historical release plan
 */
export function useHistoryPlan(source: ReleaseDataSource, scope: string, id: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.historyPlan(scope, id),
    queryFn: () => source.getHistoryPlan(scope, id),
    enabled: enabled && !!scope && !!id,
    staleTime: 60000,
  });
}

/**
 * Hook to get a specific historical release changelog
 */
export function useHistoryChangelog(source: ReleaseDataSource, scope: string, id: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.historyChangelog(scope, id),
    queryFn: () => source.getHistoryChangelog(scope, id),
    enabled: enabled && !!scope && !!id,
    staleTime: 60000,
  });
}

/**
 * Hook to generate release plan
 */
export function useGenerateReleasePlan(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GeneratePlanRequest) => source.generatePlan(request),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.plan(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.preview(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.gitTimeline(variables.scope) });
    },
  });
}

/**
 * Hook to reset release plan
 */
export function useResetReleasePlan(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scope }: { scope: string }) => source.resetPlan(scope),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.plan(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.changelog(variables.scope) });
    },
  });
}

/**
 * Hook to generate changelog
 */
export function useGenerateChangelog(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GenerateChangelogRequest) => source.generateChangelog(request),
    onSuccess: (_, variables) => {
      // Invalidate changelog queries
      queryClient.invalidateQueries({
        queryKey: releaseQueryKeys.changelog(variables.scope)
      });
      queryClient.invalidateQueries({
        queryKey: releaseQueryKeys.status(variables.scope)
      });
    },
  });
}

/**
 * Hook to save changelog (for live editing)
 */
export function useSaveChangelog(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveChangelogRequest) => source.saveChangelog(request),
    onSuccess: (_, variables) => {
      // Invalidate changelog queries
      queryClient.invalidateQueries({
        queryKey: releaseQueryKeys.changelog(variables.scope)
      });
    },
  });
}

/**
 * Hook to run release
 */
export function useRunRelease(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RunReleaseRequest) => source.runRelease(request),
    onSuccess: (_, variables) => {
      // Invalidate all release-related queries
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.plan(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.report() });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.history() });
    },
  });
}

/**
 * Hook to publish packages
 */
export function usePublish(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PublishRequest) => source.publish(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.report() });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.history() });
    },
  });
}

/**
 * Hook to rollback release
 */
export function useRollback(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RollbackRequest) => source.rollback(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.report() });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.history() });
    },
  });
}

/**
 * Hook to get git timeline and version preview
 */
export function useGitTimeline(source: ReleaseDataSource, scope: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.gitTimeline(scope),
    queryFn: () => source.getGitTimeline(scope),
    enabled: enabled && !!scope,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get release checklist status
 */
export function useReleaseChecklist(source: ReleaseDataSource, scope: string, enabled = true) {
  return useQuery({
    queryKey: releaseQueryKeys.checklist(scope),
    queryFn: () => source.getChecklist(scope),
    enabled: enabled && !!scope,
    staleTime: 5000, // Refetch frequently to show updates
    refetchInterval: 10000, // Auto-refetch every 10s
  });
}

/**
 * Hook to trigger package build
 */
export function useTriggerBuild(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BuildRequest) => source.triggerBuild(request),
    onSuccess: (_, variables) => {
      // Invalidate checklist and preview after build
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.checklist(variables.scope) });
      queryClient.invalidateQueries({ queryKey: releaseQueryKeys.preview(variables.scope) });
    },
  });
}
