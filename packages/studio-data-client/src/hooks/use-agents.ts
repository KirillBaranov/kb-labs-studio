/**
 * @module @kb-labs/studio-data-client/hooks/use-agents
 * React Query hooks for agent execution
 */

import { useQuery, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { AgentDataSource } from '../sources/agent-source';
import type {
  RunAgentRequest,
  RunAgentResponse,
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
 * Hook to execute an agent with a task
 */
export function useAgentRun(
  source: AgentDataSource,
  options?: UseMutationOptions<RunAgentResponse, Error, RunAgentRequest>
) {
  return useMutation({
    mutationFn: (request: RunAgentRequest) => source.runAgent(request),
    ...options,
  });
}
