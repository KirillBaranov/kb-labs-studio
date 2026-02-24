/**
 * @module @kb-labs/studio-data-client/hooks/use-session-turns
 * React Query hook for fetching session turns from REST API
 */

import { useQuery } from '@tanstack/react-query';
import type { Turn } from '@kb-labs/agent-contracts';
import type { AgentDataSource } from '../sources/agent-source';

interface GetSessionTurnsResponse {
  turns: Turn[];
  total: number;
}

/**
 * Fetch turns for a session from REST API
 */
export function useSessionTurns(
  source: AgentDataSource,
  sessionId: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['agent', 'sessions', sessionId, 'turns'],
    queryFn: () => {
      if (!sessionId) {
        return { turns: [], total: 0 };
      }
      return source.getSessionTurns(sessionId);
    },
    enabled: options?.enabled !== false && !!sessionId,
    staleTime: 5000, // Consider fresh for 5s
    refetchOnWindowFocus: false,
  });
}
