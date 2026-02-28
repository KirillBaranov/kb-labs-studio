import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CommitDataSource } from '../sources/commit-source';
import type {
  SummarizeRequest,
  GenerateRequest,
  PatchPlanRequest,
  RegenerateCommitRequest,
  ApplyRequest,
  PushRequest,
} from '@kb-labs/commit-contracts';

/**
 * Query keys for commit-related queries
 */
export const commitQueryKeys = {
  all: ['commit'] as const,
  scopes: () => [...commitQueryKeys.all, 'scopes'] as const,
  status: (scope?: string) => [...commitQueryKeys.all, 'status', scope ?? 'root'] as const,
  plan: (scope?: string) => [...commitQueryKeys.all, 'plan', scope ?? 'root'] as const,
  gitStatus: (scope?: string) => [...commitQueryKeys.all, 'git-status', scope ?? 'root'] as const,
  fileDiff: (file: string, scope?: string) => [...commitQueryKeys.all, 'diff', file, scope ?? 'root'] as const,
  summary: (file?: string, scope?: string) => [...commitQueryKeys.all, 'summary', file ?? 'all', scope ?? 'root'] as const,
};

/**
 * Hook to get available scopes
 */
export function useScopes(source: CommitDataSource) {
  return useQuery({
    queryKey: commitQueryKeys.scopes(),
    queryFn: () => source.getScopes(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to get commit status
 */
export function useCommitStatus(source: CommitDataSource, scope?: string, enabled = true) {
  return useQuery({
    queryKey: commitQueryKeys.status(scope),
    queryFn: () => source.getStatus(scope),
    enabled,
    staleTime: 10000, // 10 seconds
  });
}

/**
 * Hook to get commit plan
 */
export function useCommitPlan(source: CommitDataSource, scope?: string, enabled = true) {
  return useQuery({
    queryKey: commitQueryKeys.plan(scope),
    queryFn: () => source.getPlan(scope),
    enabled,
    staleTime: 10000,
  });
}

/**
 * Hook to get git status
 */
export function useGitStatus(source: CommitDataSource, scope?: string, enabled = true) {
  return useQuery({
    queryKey: commitQueryKeys.gitStatus(scope),
    queryFn: () => source.getGitStatus(scope),
    enabled,
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // Auto-refresh every 10 seconds
  });
}

/**
 * Hook to get file diff
 */
export function useFileDiff(file: string, source: CommitDataSource, scope?: string, enabled = true) {
  return useQuery({
    queryKey: commitQueryKeys.fileDiff(file, scope),
    queryFn: () => source.getFileDiff(file, scope),
    enabled: enabled && !!file,
    staleTime: 30000,
  });
}

/**
 * Hook to summarize changes using LLM
 */
export function useSummarizeChanges(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SummarizeRequest) => source.summarizeChanges(request),
    onSuccess: (data, variables) => {
      // Cache the summary result
      queryClient.setQueryData(
        commitQueryKeys.summary(variables.file, variables.scope),
        data
      );
    },
  });
}

/**
 * Hook to generate commit plan
 */
export function useGeneratePlan(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<GenerateRequest, 'dryRun' | 'allowSecrets' | 'autoConfirm'> & { dryRun?: boolean; allowSecrets?: boolean; autoConfirm?: boolean }) => {
      const fullRequest: GenerateRequest = {
        scope: request.scope,
        dryRun: request.dryRun ?? false,
        allowSecrets: request.allowSecrets ?? false,
        autoConfirm: request.autoConfirm ?? false,
      };
      return source.generatePlan(fullRequest);
    },
    onSuccess: (data, variables) => {
      // Seed plan cache directly from response (plan data is already available)
      if (data.success && data.plan) {
        queryClient.setQueryData(commitQueryKeys.plan(variables.scope), {
          hasPlan: true,
          plan: data.plan,
          scope: variables.scope,
        });
      }
      // Invalidate status + gitStatus for up-to-date counters
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.gitStatus(variables.scope) });
    },
  });
}

/**
 * Hook to edit a single commit in the plan (message, type, scope, body)
 */
export function usePatchPlan(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PatchPlanRequest) => source.patchPlan(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.plan(variables.scope) });
    },
  });
}

/**
 * Hook to regenerate a single commit using LLM
 */
export function useRegenerateCommit(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RegenerateCommitRequest) => source.regenerateCommit(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.plan(variables.scope) });
    },
  });
}

/**
 * Hook to apply commits (supports selective apply via commitIds)
 */
export function useApplyCommits(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<ApplyRequest, 'force'> & { force?: boolean }) => {
      const fullRequest: ApplyRequest = {
        scope: request.scope,
        force: request.force ?? false,
        commitIds: request.commitIds,
      };
      return source.applyCommits(fullRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.gitStatus(variables.scope) });
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.plan(variables.scope) });
    },
  });
}

/**
 * Hook to push commits
 */
export function usePushCommits(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<PushRequest, 'remote' | 'force'> & { remote?: string; force?: boolean }) => {
      const fullRequest: PushRequest = {
        scope: request.scope,
        remote: request.remote ?? 'origin',
        force: request.force ?? false,
      };
      return source.pushCommits(fullRequest);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.status(variables.scope) });
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.plan(variables.scope) });
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.gitStatus(variables.scope) });
    },
  });
}

/**
 * Hook to reset plan
 */
export function useResetPlan(source: CommitDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scope }: { scope?: string }) => source.resetPlan(scope),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.plan(variables.scope) });
      queryClient.invalidateQueries({ queryKey: commitQueryKeys.status(variables.scope) });
    },
  });
}
