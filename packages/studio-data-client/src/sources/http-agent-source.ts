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
  GetSessionEventsResponse,
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

  getEventsUrl(runId: string): string {
    // Get base URL from client and construct WebSocket URL
    const baseUrl = this.client.getBaseUrl();
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBase = baseUrl.replace(/^https?/, wsProtocol);
    return `${wsBase}/ws/plugins/agents/events/${runId}`;
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

  async getSessionEvents(
    sessionId: string,
    limit?: number,
    offset?: number
  ): Promise<GetSessionEventsResponse> {
    const params = new URLSearchParams();
    if (limit) {params.set('limit', String(limit));}
    if (offset) {params.set('offset', String(offset));}

    const query = params.toString();
    const url = `/plugins/agents/sessions/${sessionId}/events${query ? `?${query}` : ''}`;
    return this.client.fetch<GetSessionEventsResponse>(url);
  }

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    return this.client.fetch<CreateSessionResponse>('/plugins/agents/sessions', {
      method: 'POST',
      data: request,
    });
  }
}
