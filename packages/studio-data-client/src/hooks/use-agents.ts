/**
 * @module @kb-labs/studio-data-client/hooks/use-agents
 * React Query hooks for agent API
 */

import { useQuery, useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import type { AgentDataSource } from '../sources/agent-source';
import type {
  ListAgentsResponse,
  RunRequest,
  RunResponse,
  RunStatusResponse,
  CorrectionRequest,
  CorrectionResponse,
  StopResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  GetSessionResponse,
  GetSessionEventsResponse,
  CreateSessionRequest,
  CreateSessionResponse,
} from '@kb-labs/agent-contracts';

/**
 * Hook to list all available agents
 */
export function useAgentsList(source: AgentDataSource) {
  return useQuery({
    queryKey: ['agents', 'list'],
    queryFn: () => source.listAgents(),
    staleTime: 60000, // Cache for 1 minute
    retry: 2,
  });
}

/**
 * Hook to start a new agent run
 */
export function useAgentStartRun(
  source: AgentDataSource,
  options?: UseMutationOptions<RunResponse, Error, RunRequest>
) {
  return useMutation({
    mutationFn: (request: RunRequest) => source.startRun(request),
    ...options,
  });
}

/**
 * Hook to get run status
 */
export function useAgentStatus(
  source: AgentDataSource,
  runId: string | null,
  options?: { refetchInterval?: number | false }
) {
  return useQuery<RunStatusResponse>({
    queryKey: ['agents', 'run', runId],
    queryFn: () => source.getStatus(runId!),
    enabled: !!runId,
    refetchInterval: options?.refetchInterval ?? false,
    retry: 2,
  });
}

/**
 * Hook to send a correction to a running agent
 */
export function useAgentCorrection(
  source: AgentDataSource,
  options?: UseMutationOptions<CorrectionResponse, Error, { runId: string; request: CorrectionRequest }>
) {
  return useMutation({
    mutationFn: ({ runId, request }) => source.sendCorrection(runId, request),
    ...options,
  });
}

/**
 * Hook to stop a running agent
 */
export function useAgentStop(
  source: AgentDataSource,
  options?: UseMutationOptions<StopResponse, Error, { runId: string; reason?: string }>
) {
  return useMutation({
    mutationFn: ({ runId, reason }) => source.stopRun(runId, reason),
    ...options,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// Session Management Hooks
// ═══════════════════════════════════════════════════════════════════════

/**
 * Hook to list agent sessions
 */
export function useAgentSessions(
  source: AgentDataSource,
  request?: ListSessionsRequest,
  options?: { enabled?: boolean }
) {
  return useQuery<ListSessionsResponse>({
    queryKey: ['agents', 'sessions', request?.agentId, request?.status, request?.limit, request?.offset],
    queryFn: () => source.listSessions(request),
    enabled: options?.enabled ?? true,
    staleTime: 30000, // Cache for 30 seconds
    retry: 2,
  });
}

/**
 * Hook to get a specific session
 */
export function useAgentSession(
  source: AgentDataSource,
  sessionId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery<GetSessionResponse>({
    queryKey: ['agents', 'session', sessionId],
    queryFn: () => source.getSession(sessionId!),
    enabled: (options?.enabled ?? true) && !!sessionId,
    staleTime: 30000,
    retry: 2,
  });
}

/**
 * Hook to get session events (chat history)
 */
export function useAgentSessionEvents(
  source: AgentDataSource,
  sessionId: string | null,
  options?: { limit?: number; offset?: number; enabled?: boolean }
) {
  return useQuery<GetSessionEventsResponse>({
    queryKey: ['agents', 'session', sessionId, 'events', options?.limit, options?.offset],
    queryFn: () => source.getSessionEvents(sessionId!, options?.limit, options?.offset),
    enabled: (options?.enabled ?? true) && !!sessionId,
    staleTime: 10000, // Refresh more often for chat
    retry: 2,
  });
}

/**
 * Hook to create a new session
 */
export function useAgentCreateSession(
  source: AgentDataSource,
  options?: UseMutationOptions<CreateSessionResponse, Error, CreateSessionRequest>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateSessionRequest) => source.createSession(request),
    onSuccess: () => {
      // Invalidate sessions list to refetch
      void queryClient.invalidateQueries({ queryKey: ['agents', 'sessions'] });
    },
    ...options,
  });
}
