/**
 * @module @kb-labs/data-client/sources/http-system-source
 * HTTP implementation of SystemDataSource
 */

import { HttpClient } from '../client/http-client';
import { KBError } from '../errors/kb-error';
import type { SystemDataSource } from './system-source';
import type {
  SystemHealthSnapshot,
  ReadyResponse,
  NotReadyResponse,
  SystemInfoPayload,
  SystemCapabilitiesPayload,
  SystemConfigPayload,
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
    const snapshot = await this.client.fetch<SystemHealthSnapshot>('/health');

    return {
      ok: snapshot.status === 'healthy',
      timestamp: snapshot.ts,
      sources: [
        {
          name: 'system',
          ok: snapshot.status === 'healthy',
          error: snapshot.status === 'degraded' ? 'system_degraded' : undefined,
        },
      ],
      snapshot,
    };
  }

  /**
   * Get ready status
   */
  async getReady(): Promise<ReadyResponse | NotReadyResponse> {
    try {
      return await this.client.fetch<ReadyResponse>('/ready');
    } catch (error) {
      if (error instanceof KBError && error.status === 503) {
        const payload = (error.cause as { data?: unknown } | undefined)?.data;
        if (payload && typeof payload === 'object' && 'ready' in payload) {
          return payload as NotReadyResponse;
        }
        return {
          ready: false,
          reason: 'unknown',
        } as NotReadyResponse;
      }
      throw error;
    }
  }

  /**
   * Get info
   */
  async getInfo(): Promise<SystemInfoPayload> {
    const response = await this.client.fetch<InfoResponse>('/info');
    return response.data;
  }

  /**
   * Get capabilities
   */
  async getCapabilities(): Promise<SystemCapabilitiesPayload> {
    const response = await this.client.fetch<CapabilitiesResponse>('/info/capabilities');
    return response.data;
  }

  /**
   * Get config (redacted)
   */
  async getConfig(): Promise<SystemConfigPayload> {
    const response = await this.client.fetch<ConfigResponse>('/info/config');
    return response.data;
  }
}

