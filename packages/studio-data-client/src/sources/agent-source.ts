/**
 * @module @kb-labs/studio-data-client/sources/agent-source
 * Agent data source contract
 */

import type {
  RunAgentRequest,
  RunAgentResponse,
  RunAgentErrorResponse,
  ListAgentsResponse,
} from '@kb-labs/agent-contracts';

/**
 * Agent data source
 */
export interface AgentDataSource {
  /**
   * List all available agents
   */
  listAgents(): Promise<ListAgentsResponse>;

  /**
   * Execute an agent with a task
   */
  runAgent(request: RunAgentRequest): Promise<RunAgentResponse | RunAgentErrorResponse>;
}
