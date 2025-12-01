/**
 * @module @kb-labs/studio-data-client/sources/http-release-source
 * HTTP implementation of ReleaseDataSource
 */

import { HttpClient } from '../client/http-client';
import type { ReleaseDataSource } from './release-source';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';
import type { SystemHealthSnapshot } from '@kb-labs/rest-api-contracts';

/**
 * HTTP implementation of ReleaseDataSource
 */
export class HttpReleaseSource implements ReleaseDataSource {
  constructor(private client: HttpClient) {}

  async getPreview(range?: { from: string; to: string }): Promise<unknown> {
    const request = {
      fromTag: range?.from,
      toRef: range?.to,
    };

    return this.client.fetch<unknown>('/release/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  async runRelease(confirm?: boolean): Promise<ActionResult> {
    const request = {
      confirm: confirm || false,
    };

    await this.client.fetch('/release/runs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    return { ok: true };
  }

  async getHealth(): Promise<HealthStatus> {
    const snapshot = await this.client.fetch<SystemHealthSnapshot>('/health');
    
    return {
      ok: snapshot.status === 'healthy',
      timestamp: snapshot.ts,
      sources: [{
        name: 'release',
        ok: snapshot.status === 'healthy',
        error: snapshot.status === 'degraded' ? 'system_degraded' : undefined,
      }],
      snapshot,
    };
  }
}

