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
 * Date range options for analytics queries
 */
export interface DateRangeOptions {
  /**
   * Start date (ISO 8601 timestamp)
   */
  from?: string;

  /**
   * End date (ISO 8601 timestamp)
   */
  to?: string;

  /**
   * Optional model filter (LLM analytics only)
   * Can be a single model or multiple models
   */
  models?: string | string[];
}

/**
 * Daily aggregated statistics for time-series charts
 */
export interface DailyStats {
  /**
   * Date in YYYY-MM-DD format
   */
  date: string;

  /**
   * Number of events on this day
   */
  count: number;

  /**
   * Event-specific metrics (e.g., totalTokens, totalCost, avgDurationMs)
   */
  metrics?: Record<string, number>;
}

/**
 * Platform adapter analytics data source
 */
export interface AdaptersDataSource {
  /**
   * Get LLM usage statistics
   * @param options - Optional date range filter
   */
  getLLMUsage(options?: DateRangeOptions): Promise<LLMUsageStats>;

  /**
   * Get Embeddings usage statistics
   * @param options - Optional date range filter
   */
  getEmbeddingsUsage(options?: DateRangeOptions): Promise<EmbeddingsUsageStats>;

  /**
   * Get VectorStore usage statistics
   * @param options - Optional date range filter
   */
  getVectorStoreUsage(options?: DateRangeOptions): Promise<VectorStoreUsageStats>;

  /**
   * Get Cache usage statistics
   * @param options - Optional date range filter
   */
  getCacheUsage(options?: DateRangeOptions): Promise<CacheUsageStats>;

  /**
   * Get Storage usage statistics
   * @param options - Optional date range filter
   */
  getStorageUsage(options?: DateRangeOptions): Promise<StorageUsageStats>;

  /**
   * Get daily aggregated LLM statistics for time-series charts
   * @param options - Optional date range filter
   */
  getLLMDailyStats(options?: DateRangeOptions): Promise<DailyStats[]>;

  /**
   * Get daily aggregated Embeddings statistics for time-series charts
   * @param options - Optional date range filter
   */
  getEmbeddingsDailyStats(options?: DateRangeOptions): Promise<DailyStats[]>;

  /**
   * Get daily aggregated VectorStore statistics for time-series charts
   * @param options - Optional date range filter
   */
  getVectorStoreDailyStats(options?: DateRangeOptions): Promise<DailyStats[]>;

  /**
   * Get daily aggregated Cache statistics for time-series charts
   * @param options - Optional date range filter
   */
  getCacheDailyStats(options?: DateRangeOptions): Promise<DailyStats[]>;

  /**
   * Get daily aggregated Storage statistics for time-series charts
   * @param options - Optional date range filter
   */
  getStorageDailyStats(options?: DateRangeOptions): Promise<DailyStats[]>;
}
