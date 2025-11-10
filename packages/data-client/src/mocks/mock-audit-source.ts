import type { AuditDataSource } from '../sources/audit-source';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';
import auditSummaryFixture from './fixtures/audit-summary.json';
import auditPackageFixture from './fixtures/audit-package-report.json';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockAuditSource implements AuditDataSource {
  async getSummary(): Promise<unknown> {
    await delay(300);
    return auditSummaryFixture;
  }

  async getPackageReport(name: string): Promise<unknown> {
    await delay(200);
    if (name === '@kb-labs/cli') {
      return auditPackageFixture;
    }
    return auditPackageFixture;
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

