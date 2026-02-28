/**
 * @module @kb-labs/studio-data-client/hooks/use-file-changes
 * React Query hooks for file change history (rollback & approve)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AgentDataSource } from '../sources/agent-source';
import type { FileChangeSummary } from '@kb-labs/agent-contracts';

// ─── Query key factories ──────────────────────────────────────────────────────

const fileChangesKeys = {
  all: (sessionId: string) => ['agents', 'sessions', sessionId, 'changes'] as const,
  byRun: (sessionId: string, runId?: string) =>
    ['agents', 'sessions', sessionId, 'changes', runId ?? 'all'] as const,
  diff: (sessionId: string, changeId: string) =>
    ['agents', 'sessions', sessionId, 'changes', changeId, 'diff'] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch file changes for a session, optionally filtered by runId.
 */
export function useFileChanges(
  source: AgentDataSource,
  sessionId: string | null,
  runId?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: sessionId ? fileChangesKeys.byRun(sessionId, runId) : ['agents', 'sessions', null, 'changes'],
    queryFn: async (): Promise<{ changes: FileChangeSummary[]; total: number; sessionId: string; runId?: string }> => {
      if (!sessionId) {return { changes: [], total: 0, sessionId: '' };}
      return source.listFileChanges(sessionId, runId);
    },
    enabled: (options?.enabled !== false) && !!sessionId,
    staleTime: 10_000,
    retry: 1,
  });
}

/**
 * Fetch unified diff for a specific file change (immutable — staleTime Infinity).
 */
export function useFileChangeDiff(
  source: AgentDataSource,
  sessionId: string | null,
  changeId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: sessionId && changeId
      ? fileChangesKeys.diff(sessionId, changeId)
      : ['agents', 'sessions', null, 'diff'],
    queryFn: () => source.getFileDiff(sessionId!, changeId!),
    enabled: (options?.enabled !== false) && !!sessionId && !!changeId,
    staleTime: Infinity, // Diffs are immutable
    retry: 1,
  });
}

/**
 * Rollback file changes for a session/run.
 * Invalidates file changes and session turns queries on success.
 */
export function useRollbackChanges(source: AgentDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      request,
    }: {
      sessionId: string;
      request: { runId?: string; changeIds?: string[]; skipConflicts?: boolean };
    }) => source.rollbackChanges(sessionId, request),
    onSuccess: (_data, { sessionId }) => {
      void queryClient.invalidateQueries({ queryKey: fileChangesKeys.all(sessionId) });
      void queryClient.invalidateQueries({ queryKey: ['agent', 'sessions', sessionId, 'turns'] });
    },
  });
}

/**
 * Approve file changes for a session/run.
 * Invalidates file changes query on success.
 */
export function useApproveChanges(source: AgentDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      request,
    }: {
      sessionId: string;
      request: { runId?: string; changeIds?: string[] };
    }) => source.approveChanges(sessionId, request),
    onSuccess: (_data, { sessionId }) => {
      void queryClient.invalidateQueries({ queryKey: fileChangesKeys.all(sessionId) });
    },
  });
}
