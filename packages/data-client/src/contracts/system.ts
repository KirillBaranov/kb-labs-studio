import type { SystemHealthSnapshot } from '@kb-labs/api-contracts';
import type { ISODate } from './common';

export interface HealthStatus {
  ok: boolean;
  timestamp: ISODate;
  sources: Array<{
    name: string;
    ok: boolean;
    latency?: number;
    error?: string;
  }>;
  snapshot?: SystemHealthSnapshot;
}

