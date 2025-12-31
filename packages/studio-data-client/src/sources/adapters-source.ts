/**
 * @module @kb-labs/studio-data-client/sources/adapters-source
 * Platform adapter analytics data source interface
 */

import type { LLMUsageStats } from '../contracts/adapters';

/**
 * Platform adapter analytics data source
 */
export interface AdaptersDataSource {
  /**
   * Get LLM usage statistics
   */
  getLLMUsage(): Promise<LLMUsageStats>;
}
