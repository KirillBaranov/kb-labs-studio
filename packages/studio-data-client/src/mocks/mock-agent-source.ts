/**
 * @module @kb-labs/studio-data-client/mocks/mock-agent-source
 * Mock implementation of AgentDataSource for development
 */

import type { AgentDataSource } from '../sources/agent-source';
import type {
  RunAgentRequest,
  RunAgentResponse,
  RunAgentErrorResponse,
  ListAgentsResponse,
} from '@kb-labs/agent-contracts';

/**
 * Mock agent data source
 */
export class MockAgentSource implements AgentDataSource {
  async listAgents(): Promise<ListAgentsResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      agents: [
        {
          id: 'mind-assistant',
          name: 'Mind Assistant',
          description: 'Intelligent code assistant powered by Mind RAG for semantic search and code understanding',
          tools: ['mind:rag-query', 'mind:rag-status', 'fs:read', 'fs:search'],
        },
        {
          id: 'coding-assistant',
          name: 'Coding Assistant',
          description: 'A helpful agent that assists with coding tasks, file operations, and running commands',
          tools: ['fs:read', 'fs:write', 'fs:search', 'shell:exec', 'kb-labs:*'],
        },
        {
          id: 'code-reviewer',
          name: 'Code Reviewer',
          description: 'Performs code review, identifies bugs, suggests improvements, and checks code quality',
          tools: ['fs:read', 'fs:search', 'shell:exec'],
        },
      ],
      total: 3,
    };
  }

  async runAgent(request: RunAgentRequest): Promise<RunAgentResponse | RunAgentErrorResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful response
    return {
      success: true,
      agentId: request.agentId,
      task: request.task,
      result: `This is a mock response for "${request.task}". Real agent integration coming soon! The ${request.agentId} would normally process this task using its available tools.`,
      stats: {
        steps: 3,
        totalTokens: 1200,
        durationMs: 1500,
        toolCallCount: 2,
        toolsUsed: ['fs:read', 'mind:rag-query'],
      },
      steps: [
        {
          step: 1,
          toolCalls: [
            {
              name: 'fs:read',
              input: { path: 'example.ts' },
              output: 'File contents...',
              success: true,
            },
          ],
          tokensUsed: 400,
          durationMs: 500,
        },
        {
          step: 2,
          toolCalls: [
            {
              name: 'mind:rag-query',
              input: { query: 'example query' },
              output: 'RAG results...',
              success: true,
            },
          ],
          tokensUsed: 800,
          durationMs: 1000,
        },
      ],
    };
  }
}
