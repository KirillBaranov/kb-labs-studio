/**
 * @module @kb-labs/data-client/sources/http-system-source
 * HTTP implementation of SystemDataSource
 */

import { HttpClient } from '../client/http-client';
import type { SystemDataSource } from './system-source';
import type {
  HealthResponse,
  ReadyResponse,
  InfoResponse,
  CapabilitiesResponse,
  ConfigResponse,
} from '@kb-labs/api-contracts';
import type { HealthStatus } from '../contracts/system';

/**
 * HTTP implementation of SystemDataSource
 */
export class HttpSystemSource implements SystemDataSource {
  constructor(private client: HttpClient) {}

  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.fetch<HealthResponse['data']>('/health/live');
    
    return {
      ok: response.status === 'ok',
      timestamp: new Date().toISOString(),
      sources: [{
        name: 'system',
        ok: response.status === 'ok',
      }],
    };
  }

  /**
   * Get ready status
   */
  async getReady(): Promise<ReadyResponse['data']> {
    return this.client.fetch<ReadyResponse['data']>('/health/ready');
  }

  /**
   * Get info
   */
  async getInfo(): Promise<InfoResponse['data']> {
    return this.client.fetch<InfoResponse['data']>('/info');
  }

  /**
   * Get capabilities
   */
  async getCapabilities(): Promise<CapabilitiesResponse['data']> {
    return this.client.fetch<CapabilitiesResponse['data']>('/info/capabilities');
  }

  /**
   * Get config (redacted)
   */
  async getConfig(): Promise<ConfigResponse['data']> {
    return this.client.fetch<ConfigResponse['data']>('/info/config');
  }
}

