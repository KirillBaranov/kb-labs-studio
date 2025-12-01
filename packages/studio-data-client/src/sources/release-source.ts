import type { ActionResult } from '../contracts/common';
import type { HealthStatus } from '../contracts/system';

export interface ReleaseDataSource {
  getPreview(range?: { from: string; to: string }): Promise<unknown>;
  runRelease(confirm?: boolean): Promise<ActionResult>;
  getHealth(): Promise<HealthStatus>;
}

