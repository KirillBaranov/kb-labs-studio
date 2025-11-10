import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';

export interface AuditDataSource {
  getSummary(): Promise<unknown>;
  getPackageReport(name: string): Promise<unknown>;
  runAudit(scope?: string[]): Promise<ActionResult>;
  getHealth(): Promise<HealthStatus>;
}

