/**
 * @module @kb-labs/studio-data-client/mocks/mock-adapters-source
 * Mock implementation of AdaptersDataSource
 */

import type { AdaptersDataSource } from '../sources/adapters-source';
import type { LLMUsageStats } from '../contracts/adapters';

/**
 * Mock adapters data source for testing
 */
export class MockAdaptersSource implements AdaptersDataSource {
  async getLLMUsage(): Promise<LLMUsageStats> {
    return {
      totalRequests: 1247,
      totalTokens: 3_456_789,
      totalCost: 12.45,
      byModel: {
        'gpt-4': {
          requests: 234,
          promptTokens: 45_678,
          completionTokens: 23_456,
          totalTokens: 69_134,
          cost: 4.15,
          avgDurationMs: 2345,
        },
        'gpt-3.5-turbo': {
          requests: 789,
          promptTokens: 234_567,
          completionTokens: 123_456,
          totalTokens: 358_023,
          cost: 0.54,
          avgDurationMs: 876,
        },
        'claude-3-sonnet': {
          requests: 224,
          promptTokens: 567_890,
          completionTokens: 234_567,
          totalTokens: 802_457,
          cost: 7.76,
          avgDurationMs: 1567,
        },
      },
      errors: 12,
      timeRange: {
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
    };
  }
}
