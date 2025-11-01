import type { AuditSummary, AuditPackageReport } from '../contracts/audit';
import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';

export interface AuditDataSource {
  getSummary(): Promise<AuditSummary>;
  getPackageReport(name: string): Promise<AuditPackageReport>;
  runAudit(scope?: string[]): Promise<ActionResult>;
  getHealth(): Promise<HealthStatus>;
}

