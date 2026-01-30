/**
 * @module @kb-labs/studio-data-client/sources/http-agent-source
 * HTTP implementation of AgentDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { AgentDataSource } from './agent-source';
import type {
  AgentRequest,
  AgentSession,
  AgentSpecification,
} from '@kb-labs/agent-contracts';

/**
 * HTTP implementation of AgentDataSource
 * Calls REST API /v1/plugins/agents/* endpoints
 */
export class HttpAgentSource implements AgentDataSource {
  constructor(private readonly client: HttpClient) {}

  async listAgents(): Promise<AgentSpecification[]> {
    return this.client.fetch<AgentSpecification[]>('/plugins/agents');
  }

  async runAgent(request: AgentRequest): Promise<AgentSession> {
    return this.client.fetch<AgentSession>('/plugins/agents/run', {
      method: 'POST',
      data: request,
    });
  }
}
