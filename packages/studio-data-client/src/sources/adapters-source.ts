/**
 * @module @kb-labs/studio-data-client/sources/adapters-source
 * Platform adapter analytics data source interface
 */

import type {
  LLMUsageStats,
  EmbeddingsUsageStats,
  VectorStoreUsageStats,
  CacheUsageStats,
  StorageUsageStats,
} from '../contracts/adapters';

/**
 * Platform adapter analytics data source
 */
export interface AdaptersDataSource {
  /**
   * Get LLM usage statistics
   */
  getLLMUsage(): Promise<LLMUsageStats>;

  /**
   * Get Embeddings usage statistics
   */
  getEmbeddingsUsage(): Promise<EmbeddingsUsageStats>;

  /**
   * Get VectorStore usage statistics
   */
  getVectorStoreUsage(): Promise<VectorStoreUsageStats>;

  /**
   * Get Cache usage statistics
   */
  getCacheUsage(): Promise<CacheUsageStats>;

  /**
   * Get Storage usage statistics
   */
  getStorageUsage(): Promise<StorageUsageStats>;
}
