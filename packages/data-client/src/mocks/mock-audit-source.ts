import type { AuditDataSource } from '../sources/audit-source';
import type { AuditSummary, AuditPackageReport } from '../contracts/audit';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';
import auditSummaryFixture from './fixtures/audit-summary.json';
import auditPackageFixture from './fixtures/audit-package-report.json';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAuditSource implements AuditDataSource {
  async getSummary(): Promise<AuditSummary> {
    await delay(300);
    return auditSummaryFixture as AuditSummary;
  }

  async getPackageReport(name: string): Promise<AuditPackageReport> {
    await delay(200);
    if (name === '@kb-labs/cli') {
      return auditPackageFixture as AuditPackageReport;
    }
    return {
      pkg: { name, version: '1.0.0' },
      lastRun: {
        id: `run-${name}`,
        startedAt: '2025-01-01T10:00:00.000Z',
        endedAt: '2025-01-01T10:02:00.000Z',
        status: 'ok',
      },
      checks: [
        { id: 'style', ok: true },
        { id: 'types', ok: true },
        { id: 'tests', ok: true },
        { id: 'build', ok: true },
        { id: 'devlink', ok: true },
        { id: 'mind', ok: true },
      ],
      artifacts: { json: '/tmp/audit.json', md: '/tmp/audit.md' },
    };
  }

  async runAudit(scope?: string[]): Promise<ActionResult> {
    await delay(600);
    return {
      ok: true,
      message: 'Audit completed successfully',
      runId: `run-${Date.now()}`,
    };
  }

  async getHealth(): Promise<HealthStatus> {
    await delay(100);
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      sources: [
        { name: 'audit', ok: true, latency: 100 },
      ],
    };
  }
}

