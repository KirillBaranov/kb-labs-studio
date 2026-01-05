/**
 * @module @kb-labs/studio-data-client/sources/http-audit-source
 * HTTP implementation of AuditDataSource
 */

import { HttpClient } from '../client/http-client';
import type { AuditDataSource } from './audit-source';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';
import type { SystemHealthSnapshot } from '@kb-labs/rest-api-contracts';

/**
 * HTTP implementation of AuditDataSource
 */
export class HttpAuditSource implements AuditDataSource {
  constructor(private client: HttpClient) {}

  async getSummary(): Promise<unknown> {
    return this.client.fetch<unknown>('/audit/summary');
  }

  async getPackageReport(_name: string): Promise<unknown> {
    return this.client.fetch<unknown>('/audit/report/latest');
  }

  async runAudit(scope?: string[]): Promise<ActionResult> {
    const request = {
      scope: scope?.join(',') || undefined,
    };

    await this.client.fetch('/audit/runs', {
      method: 'POST',
      data: request,
    });

    return { ok: true };
  }

  async getHealth(): Promise<HealthStatus> {
    const snapshot = await this.client.fetch<SystemHealthSnapshot>('/health');
    
    return {
      ok: snapshot.status === 'healthy',
      timestamp: snapshot.ts,
      sources: [{
        name: 'audit',
        ok: snapshot.status === 'healthy',
        error: snapshot.status === 'degraded' ? 'system_degraded' : undefined,
      }],
      snapshot,
    };
  }
}

