/**
 * @module @kb-labs/studio-data-client/sources/agent-source
 * Agent data source contract for Studio UI
 */

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
 * Agent data source interface
 * Provides methods for interacting with the Agent REST API
 */
export interface AgentDataSource {
  /**
   * List all available agents
   */
  listAgents(): Promise<ListAgentsResponse>;

  /**
   * Start a new agent run (async - returns immediately with runId)
   */
  startRun(request: RunRequest): Promise<RunResponse>;

  /**
   * Get status of a run
   */
  getStatus(runId: string): Promise<RunStatusResponse>;

  /**
   * Send a correction to a running agent
   */
  sendCorrection(runId: string, request: CorrectionRequest): Promise<CorrectionResponse>;

  /**
   * Stop a running agent
   */
  stopRun(runId: string, reason?: string): Promise<StopResponse>;

  /**
   * Get WebSocket URL for event streaming
   * Note: This returns the URL, connection is managed by useAgentWebSocket hook
   */
  getEventsUrl(runId: string): string;

  // ═══════════════════════════════════════════════════════════════════════
  // Session Management
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * List all sessions
   */
  listSessions(request?: ListSessionsRequest): Promise<ListSessionsResponse>;

  /**
   * Get session details
   */
  getSession(sessionId: string): Promise<GetSessionResponse>;

  /**
   * Get session events (chat history)
   */
  getSessionEvents(sessionId: string, limit?: number, offset?: number): Promise<GetSessionEventsResponse>;

  /**
   * Create a new session
   */
  createSession(request: CreateSessionRequest): Promise<CreateSessionResponse>;
}
