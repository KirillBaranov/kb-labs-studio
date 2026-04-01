/**
 * @module @kb-labs/studio-data-client/sources/http-audit-source
 * HTTP implementation of AuditDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { AuditDataSource } from './audit-source';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';
import type { ServiceObservabilityHealth } from '@kb-labs/core-contracts';

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
    const snapshot = await this.client.fetch<ServiceObservabilityHealth>('/observability/health');

    return {
      ok: snapshot.status === 'healthy',
      timestamp: snapshot.observedAt,
      sources: snapshot.checks.length > 0
        ? snapshot.checks.map((check: ServiceObservabilityHealth['checks'][number]) => ({
          name: check.id,
          ok: check.status === 'ok',
          latency: check.latencyMs,
          error: check.status === 'warn'
            ? 'system_degraded'
            : check.status === 'error'
              ? check.message ?? 'system_error'
              : undefined,
        }))
        : [{
          name: 'audit',
          ok: snapshot.status === 'healthy',
          error: snapshot.status === 'degraded' ? 'system_degraded' : undefined,
        }],
      snapshot,
    };
  }
}
