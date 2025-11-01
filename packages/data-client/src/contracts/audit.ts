import type { PackageRef, RunRef, ID, ISODate } from './common';

export interface AuditSummary {
  ts: ISODate;
  totals: {
    packages: number;
    ok: number;
    warn: number;
    fail: number;
    durationMs: number;
  };
  topFailures: Array<{
    pkg: string;
    checks: Array<'style' | 'types' | 'tests' | 'build' | 'devlink' | 'mind'>;
  }>;
}

export interface AuditCheck {
  id: 'style' | 'types' | 'tests' | 'build' | 'devlink' | 'mind';
  ok: boolean;
  errors?: number;
  warnings?: number;
  meta?: unknown;
}

export interface AuditArtifacts {
  json?: string;
  md?: string;
  txt?: string;
  html?: string;
}

export interface AuditPackageReport {
  pkg: PackageRef;
  lastRun: RunRef;
  checks: AuditCheck[];
  artifacts: AuditArtifacts;
}

