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
  CreateSessionRequest,
  CreateSessionResponse,
  Turn,
  FileChangeSummary,
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
  getEventsUrl(sessionId: string): string;

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
   * Get session turns (turn-based UI) - NEW Phase 2
   */
  getSessionTurns(sessionId: string, limit?: number, offset?: number): Promise<{ turns: Turn[]; total: number }>;

  /**
   * Create a new session
   */
  createSession(request: CreateSessionRequest): Promise<CreateSessionResponse>;

  // ═══════════════════════════════════════════════════════════════════════
  // File Change History (Rollback & Approve)
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * List file changes for a session, optionally scoped to a specific runId.
   */
  listFileChanges(sessionId: string, runId?: string): Promise<{ changes: FileChangeSummary[]; total: number; sessionId: string; runId?: string }>;

  /**
   * Get full unified diff for a specific file change.
   */
  getFileDiff(sessionId: string, changeId: string): Promise<{
    changeId: string;
    filePath: string;
    operation: 'write' | 'patch' | 'delete';
    diff: string;
    before?: { hash: string; size: number };
    after: { hash: string; size: number };
    linesAdded: number;
    linesRemoved: number;
    isNew: boolean;
    timestamp: string;
  }>;

  /**
   * Rollback file changes for a session/run.
   */
  rollbackChanges(sessionId: string, request: { runId?: string; changeIds?: string[]; skipConflicts?: boolean }): Promise<{
    rolledBack: number;
    skipped: number;
    conflicts: Array<{ filePath: string; changeId: string; reason: string }>;
    success: boolean;
  }>;

  /**
   * Approve file changes for a session/run.
   */
  approveChanges(sessionId: string, request: { runId?: string; changeIds?: string[] }): Promise<{
    approved: number;
    changeIds: string[];
    approvedAt: string;
  }>;
}
