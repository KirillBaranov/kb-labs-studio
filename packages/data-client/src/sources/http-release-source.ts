/**
 * @module @kb-labs/data-client/sources/http-release-source
 * HTTP implementation of ReleaseDataSource
 */

import { HttpClient } from '../client/http-client';
import type { ReleaseDataSource } from './release-source';
import type {
  ReleasePreviewRequest,
  ReleasePreviewResponse,
  CreateReleaseRunRequest,
  CreateReleaseRunResponse,
} from '@kb-labs/api-contracts';
import type { ReleasePreview } from '../contracts/release';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';

/**
 * HTTP implementation of ReleaseDataSource
 */
export class HttpReleaseSource implements ReleaseDataSource {
  constructor(private client: HttpClient) {}

  async getPreview(range?: { from: string; to: string }): Promise<ReleasePreview> {
    const request: ReleasePreviewRequest = {
      fromTag: range?.from,
      toRef: range?.to,
    };

      // Return API response directly - already in api-contracts format
      return this.client.fetch<ReleasePreviewResponse['data']>(
        '/release/preview',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );
  }

  async runRelease(confirm?: boolean): Promise<ActionResult> {
    const request: CreateReleaseRunRequest = {
      confirm: confirm || false,
    };

    const response = await this.client.fetch<CreateReleaseRunResponse['data']>(
      '/release/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );

    return {
      ok: true,
      runId: response.runId,
    };
  }

  async getHealth(): Promise<HealthStatus> {
    const response = await this.client.fetch<{ status: 'ok'; version: string; node: string; uptimeSec: number }>(
      '/health/live'
    );
    
    return {
      ok: response.status === 'ok',
      timestamp: new Date().toISOString(),
      sources: [{
        name: 'release',
        ok: response.status === 'ok',
      }],
    };
  }
}

