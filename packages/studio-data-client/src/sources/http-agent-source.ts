/**
 * @module @kb-labs/studio-data-client/sources/http-agent-source
 * HTTP implementation of AgentDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { AgentDataSource } from './agent-source';
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
} from '@kb-labs/agent-contracts';

/**
 * HTTP implementation of AgentDataSource
 * Calls REST API /api/v1/plugins/agents/* endpoints
 */
export class HttpAgentSource implements AgentDataSource {
  constructor(private readonly client: HttpClient) {}

  async listAgents(): Promise<ListAgentsResponse> {
    return this.client.fetch<ListAgentsResponse>('/plugins/agents');
  }

  async startRun(request: RunRequest): Promise<RunResponse> {
    return this.client.fetch<RunResponse>('/plugins/agents/run', {
      method: 'POST',
      data: request,
    });
  }

  async getStatus(runId: string): Promise<RunStatusResponse> {
    return this.client.fetch<RunStatusResponse>(`/plugins/agents/run/${runId}`);
  }

  async sendCorrection(runId: string, request: CorrectionRequest): Promise<CorrectionResponse> {
    return this.client.fetch<CorrectionResponse>(`/plugins/agents/run/${runId}/correct`, {
      method: 'POST',
      data: request,
    });
  }

  async stopRun(runId: string, reason?: string): Promise<StopResponse> {
    return this.client.fetch<StopResponse>(`/plugins/agents/run/${runId}/stop`, {
      method: 'POST',
      data: reason ? { reason } : {},
    });
  }

  getEventsUrl(sessionId: string): string {
    // WS lives under the same /api/v1 prefix as HTTP, so gateway proxies both.
    // baseUrl = "http://host/api/v1" → wsBase = "ws://host/api/v1"
    const baseUrl = this.client.getBaseUrl();
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBase = baseUrl.replace(/^https?/, wsProtocol);
    return `${wsBase}/ws/plugins/agents/session/${sessionId}`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Session Management
  // ═══════════════════════════════════════════════════════════════════════

  async listSessions(request?: ListSessionsRequest): Promise<ListSessionsResponse> {
    const params = new URLSearchParams();
    if (request?.agentId) {params.set('agentId', request.agentId);}
    if (request?.limit) {params.set('limit', String(request.limit));}
    if (request?.offset) {params.set('offset', String(request.offset));}
    if (request?.status) {params.set('status', request.status);}

    const query = params.toString();
    const url = `/plugins/agents/sessions${query ? `?${query}` : ''}`;
    return this.client.fetch<ListSessionsResponse>(url);
  }

  async getSession(sessionId: string): Promise<GetSessionResponse> {
    return this.client.fetch<GetSessionResponse>(`/plugins/agents/sessions/${sessionId}`);
  }

  async getSessionTurns(
    sessionId: string,
    limit?: number,
    offset?: number
  ): Promise<{ turns: import('@kb-labs/agent-contracts').Turn[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) {params.set('limit', String(limit));}
    if (offset) {params.set('offset', String(offset));}

    const query = params.toString();
    const url = `/plugins/agents/sessions/${sessionId}/turns${query ? `?${query}` : ''}`;
    return this.client.fetch<{ turns: import('@kb-labs/agent-contracts').Turn[]; total: number }>(url);
  }

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.client.fetch<CreateSessionResponse>('/plugins/agents/sessions', {
      method: 'POST',
      data: request,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // File Change History (Rollback & Approve)
  // ═══════════════════════════════════════════════════════════════════════

  async listFileChanges(sessionId: string, runId?: string): Promise<{ changes: import('@kb-labs/agent-contracts').FileChangeSummary[]; total: number; sessionId: string; runId?: string }> {
    const query = runId ? `?runId=${encodeURIComponent(runId)}` : '';
    return this.client.fetch(`/plugins/agents/sessions/${sessionId}/changes${query}`);
  }

  async getFileDiff(sessionId: string, changeId: string): Promise<{
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
  }> {
    return this.client.fetch(`/plugins/agents/sessions/${sessionId}/changes/${encodeURIComponent(changeId)}/diff`);
  }

  async rollbackChanges(sessionId: string, request: { runId?: string; changeIds?: string[]; skipConflicts?: boolean }): Promise<{
    rolledBack: number;
    skipped: number;
    conflicts: Array<{ filePath: string; changeId: string; reason: string }>;
    success: boolean;
  }> {
    return this.client.fetch(`/plugins/agents/sessions/${sessionId}/rollback`, {
      method: 'POST',
      data: request,
    });
  }

  async approveChanges(sessionId: string, request: { runId?: string; changeIds?: string[] }): Promise<{
    approved: number;
    changeIds: string[];
    approvedAt: string;
  }> {
    return this.client.fetch(`/plugins/agents/sessions/${sessionId}/approve`, {
      method: 'POST',
      data: request,
    });
  }
}
