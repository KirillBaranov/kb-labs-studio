/**
 * @module @kb-labs/studio-data-client/sources/agent-source
 * Agent data source contract
 */

import type {
  AgentRequest,
  AgentSession,
  AgentSpecification,
} from '@kb-labs/agent-contracts';

/**
 * Agent data source
 */
export interface AgentDataSource {
  /**
   * List all available agents
   */
  listAgents(): Promise<AgentSpecification[]>;

  /**
   * Execute an agent with a task
   */
  runAgent(request: AgentRequest): Promise<AgentSession>;
}
