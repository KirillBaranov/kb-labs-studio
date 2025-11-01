import type { HealthStatus } from '../contracts/system';

export interface SystemDataSource {
  getHealth(): Promise<HealthStatus>;
}

