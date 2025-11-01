import type { SystemDataSource } from '../sources/system-source';
import type { HealthStatus } from '../contracts/system';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockSystemSource implements SystemDataSource {
  async getHealth(): Promise<HealthStatus> {
    await delay(150);
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      sources: [
        { name: 'audit', ok: true, latency: 100 },
        { name: 'release', ok: true, latency: 120 },
        { name: 'system', ok: true, latency: 50 },
      ],
    };
  }
}

