/**
 * @module @kb-labs/data-client/sources/http-audit-source
 * HTTP implementation of AuditDataSource
 */

import { HttpClient } from '../client/http-client';
import type { AuditDataSource } from './audit-source';
import type {
  GetAuditSummaryResponse,
  GetAuditReportResponse,
  CreateAuditRunRequest,
  CreateAuditRunResponse,
  JobResponse,
} from '@kb-labs/api-contracts';
import type { AuditSummary, AuditPackageReport } from '../contracts/audit';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';

/**
 * HTTP implementation of AuditDataSource
 */
export class HttpAuditSource implements AuditDataSource {
  constructor(private client: HttpClient) {}

  async getSummary(): Promise<AuditSummary> {
    // Return API response directly - already in api-contracts format
    return this.client.fetch<GetAuditSummaryResponse['data']>('/audit/summary');
  }

  async getPackageReport(name: string): Promise<AuditPackageReport> {
    // Return API response directly - already in api-contracts format
    return this.client.fetch<GetAuditReportResponse['data']>('/audit/report/latest');
  }

  async runAudit(scope?: string[]): Promise<ActionResult> {
    const request: CreateAuditRunRequest = {
      scope: scope?.join(',') || undefined,
    };

    const response = await this.client.fetch<CreateAuditRunResponse['data']>(
      '/audit/runs',
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
        name: 'audit',
        ok: response.status === 'ok',
      }],
    };
  }
}

