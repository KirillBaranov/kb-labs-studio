/**
 * @module @kb-labs/studio-data-client/sources/http-adapters-source
 * HTTP implementation of AdaptersDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { AdaptersDataSource } from './adapters-source';
import type {
  LLMUsageStats,
  EmbeddingsUsageStats,
  VectorStoreUsageStats,
  CacheUsageStats,
  StorageUsageStats,
} from '../contracts/adapters';

/**
 * HTTP implementation of AdaptersDataSource
 * Calls REST API /v1/adapters/* endpoints
 */
export class HttpAdaptersSource implements AdaptersDataSource {
  constructor(private readonly client: HttpClient) {}

  async getLLMUsage(): Promise<LLMUsageStats> {
    return await this.client.fetch<LLMUsageStats>('/adapters/llm/usage');
  }

  async getEmbeddingsUsage(): Promise<EmbeddingsUsageStats> {
    return await this.client.fetch<EmbeddingsUsageStats>('/adapters/embeddings/usage');
  }

  async getVectorStoreUsage(): Promise<VectorStoreUsageStats> {
    return await this.client.fetch<VectorStoreUsageStats>('/adapters/vectorstore/usage');
  }

  async getCacheUsage(): Promise<CacheUsageStats> {
    return await this.client.fetch<CacheUsageStats>('/adapters/cache/usage');
  }

  async getStorageUsage(): Promise<StorageUsageStats> {
    return await this.client.fetch<StorageUsageStats>('/adapters/storage/usage');
  }
}
