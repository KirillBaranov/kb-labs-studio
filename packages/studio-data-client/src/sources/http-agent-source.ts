/**
 * @module @kb-labs/studio-data-client/sources/http-agent-source
 * HTTP implementation of AgentDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { AgentDataSource } from './agent-source';
import type {
  RunAgentRequest,
  RunAgentResponse,
  RunAgentErrorResponse,
  ListAgentsResponse,
} from '@kb-labs/agent-contracts';

/**
 * HTTP implementation of AgentDataSource
 * Calls REST API /v1/plugins/agents/* endpoints
 */
export class HttpAgentSource implements AgentDataSource {
  constructor(private readonly client: HttpClient) {}

  async listAgents(): Promise<ListAgentsResponse> {
    return await this.client.fetch<ListAgentsResponse>('/plugins/agents');
  }

  async runAgent(request: RunAgentRequest): Promise<RunAgentResponse | RunAgentErrorResponse> {
    return await this.client.fetch<RunAgentResponse | RunAgentErrorResponse>('/plugins/agents/run', {
      method: 'POST',
      data: request,
    });
  }
}
