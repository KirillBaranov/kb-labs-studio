import { describe, expect, it, vi } from 'vitest';
import { HttpSystemSource } from '../http-system-source';
import { HttpAuditSource } from '../http-audit-source';

class StubClient {
  fetch = vi.fn();
}

const OBSERVABILITY_HEALTH = {
  schema: 'kb.observability/1',
  contractVersion: '1.0',
  serviceId: 'rest',
  instanceId: 'rest-1',
  observedAt: '2026-04-01T10:00:00.000Z',
  status: 'degraded',
  uptimeSec: 120,
  metricsEndpoint: '/api/v1/metrics',
  logsSource: 'rest',
  capabilities: ['httpMetrics', 'eventLoopMetrics', 'operationMetrics', 'logCorrelation'],
  checks: [
    { id: 'registry', status: 'ok', message: 'Registry loaded', latencyMs: 12 },
    { id: 'plugin-routes', status: 'warn', message: 'Routes still mounting', latencyMs: 18 },
  ],
  state: 'partial_observability',
} as const;

describe('HttpSystemSource', () => {
  it('maps observability health into studio health status', async () => {
    const client = new StubClient();
    client.fetch.mockResolvedValue(OBSERVABILITY_HEALTH);
    const source = new HttpSystemSource(client as any);

    const result = await source.getHealth();

    expect(client.fetch).toHaveBeenCalledWith('/observability/health');
    expect(result.ok).toBe(false);
    expect(result.timestamp).toBe(OBSERVABILITY_HEALTH.observedAt);
    expect(result.sources).toEqual([
      { name: 'registry', ok: true, latency: 12, error: undefined },
      { name: 'plugin-routes', ok: false, latency: 18, error: 'system_degraded' },
    ]);
    expect(result.snapshot).toEqual(OBSERVABILITY_HEALTH);
  });
});

describe('HttpAuditSource', () => {
  it('reuses observability health as canonical backend health source', async () => {
    const client = new StubClient();
    client.fetch.mockResolvedValue(OBSERVABILITY_HEALTH);
    const source = new HttpAuditSource(client as any);

    const result = await source.getHealth();

    expect(client.fetch).toHaveBeenCalledWith('/observability/health');
    expect(result.ok).toBe(false);
    expect(result.sources[1]).toEqual({
      name: 'plugin-routes',
      ok: false,
      latency: 18,
      error: 'system_degraded',
    });
    expect(result.snapshot).toEqual(OBSERVABILITY_HEALTH);
  });
});
