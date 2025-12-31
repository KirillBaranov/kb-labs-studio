/**
 * @module @kb-labs/studio-data-client/mocks/mock-adapters-source
 * Mock implementation of AdaptersDataSource
 */

import type { AdaptersDataSource } from '../sources/adapters-source';
import type {
  LLMUsageStats,
  EmbeddingsUsageStats,
  VectorStoreUsageStats,
  CacheUsageStats,
  StorageUsageStats,
} from '../contracts/adapters';

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

  async getEmbeddingsUsage(): Promise<EmbeddingsUsageStats> {
    return {
      totalRequests: 3456,
      totalTextLength: 1_234_567,
      totalCost: 2.47,
      errors: 8,
      avgDurationMs: 234,
      batchRequests: 456,
      singleRequests: 3000,
      avgBatchSize: 15.3,
    };
  }

  async getVectorStoreUsage(): Promise<VectorStoreUsageStats> {
    return {
      searchQueries: 2345,
      upsertOperations: 567,
      deleteOperations: 89,
      avgSearchDuration: 45.6,
      avgSearchScore: 0.87,
      avgResultsCount: 12.4,
      totalVectorsUpserted: 45_678,
      totalVectorsDeleted: 1234,
    };
  }

  async getCacheUsage(): Promise<CacheUsageStats> {
    return {
      totalGets: 15_678,
      hits: 13_456,
      misses: 2222,
      hitRate: 85.8,
      sets: 3456,
      avgGetDuration: 2.3,
      avgSetDuration: 5.7,
    };
  }

  async getStorageUsage(): Promise<StorageUsageStats> {
    return {
      readOperations: 8765,
      writeOperations: 2345,
      deleteOperations: 234,
      totalBytesRead: 123_456_789,
      totalBytesWritten: 45_678_901,
      avgReadDuration: 12.4,
      avgWriteDuration: 34.5,
    };
  }
}
