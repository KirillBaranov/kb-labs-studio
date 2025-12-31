/**
 * @module @kb-labs/studio-data-client/sources/http-adapters-source
 * HTTP implementation of AdaptersDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { AdaptersDataSource } from './adapters-source';
import type { LLMUsageStats } from '../contracts/adapters';

/**
 * HTTP implementation of AdaptersDataSource
 * Calls REST API /v1/adapters/* endpoints
 */
export class HttpAdaptersSource implements AdaptersDataSource {
  constructor(private readonly client: HttpClient) {}

  async getLLMUsage(): Promise<LLMUsageStats> {
    return await this.client.fetch<LLMUsageStats>('/adapters/llm/usage');
  }
}
