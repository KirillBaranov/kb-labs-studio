/**
 * @module @kb-labs/data-client/contracts/audit
 * Re-export audit contracts from api-contracts (single source of truth)
 */

import type {
  GetAuditSummaryResponse,
  GetAuditReportResponse,
} from '@kb-labs/api-contracts';

export type { GetAuditSummaryResponse, GetAuditReportResponse };

export type AuditSummary = GetAuditSummaryResponse['data'];
export type AuditPackageReport = GetAuditReportResponse['data'];

