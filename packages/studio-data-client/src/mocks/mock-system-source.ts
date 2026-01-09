import type { SystemDataSource, RoutesResponse } from '../sources/system-source';
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

  async getRoutes(): Promise<RoutesResponse> {
    await delay(100);
    return {
      schema: 'kb.routes/1',
      ts: new Date().toISOString(),
      count: 5,
      routes: [
        { method: 'GET', url: '/api/v1/health' },
        { method: 'GET', url: '/api/v1/ready' },
        { method: 'GET', url: '/api/v1/plugins' },
        { method: 'GET', url: '/api/v1/plugins/:id' },
        { method: 'POST', url: '/api/v1/workflows/run' },
      ],
    };
  }

  getBaseUrl(): string {
    return 'http://localhost:5050/api/v1';
  }
}

