/**
 * @module @kb-labs/studio-data-client/mocks/mock-metrics-source
 * Mock implementation of MetricsDataSource
 */

import type { MetricsDataSource, MetricsSnapshot } from '../sources/metrics-source';

/**
 * Mock implementation of MetricsDataSource
 */
export class MockMetricsSource implements MetricsDataSource {
  async getMetrics(): Promise<MetricsSnapshot> {
    return {
      requests: {
        total: 1234,
        byMethod: { GET: 800, POST: 300, PUT: 100, DELETE: 34 },
        byStatus: { '2xx': 1100, '4xx': 100, '5xx': 34 },
        byRoute: {},
        byTenant: {},
      },
      latency: {
        total: 12500,
        count: 1234,
        min: 5,
        max: 450,
        average: 10.13,
        p50: 8.5,
        p95: 35.2,
        p99: 120.5,
        histogram: [
          {
            route: 'GET /v1/health',
            count: 500,
            total: 2500,
            max: 15,
            byStatus: { '200': 500 },
            budgetMs: null,
          },
          {
            route: 'GET /v1/studio/registry',
            count: 200,
            total: 4000,
            max: 50,
            byStatus: { '200': 200 },
            budgetMs: null,
          },
        ],
      },
      perPlugin: [],
      perTenant: [],
      errors: {
        total: 134,
        byCode: { '404': 100, '500': 34 },
      },
      timestamps: {
        startTime: Date.now() - 3600000,
        lastRequest: Date.now(),
      },
      headers: {
        filteredInbound: 0,
        filteredOutbound: 0,
        sensitiveInbound: 0,
        validationErrors: 0,
        varyApplied: 0,
        dryRunDecisions: 0,
        perPlugin: [],
      },
      redis: {
        updates: 10,
        healthyTransitions: 2,
        unhealthyTransitions: 0,
        lastUpdateTs: Date.now(),
        lastHealthyTs: Date.now(),
        lastUnhealthyTs: null,
        lastStatus: {
          enabled: false,
          healthy: false,
          roles: {},
        },
        roleStates: [],
      },
      uptime: {
        seconds: 3600,
        startTime: new Date(Date.now() - 3600000).toISOString(),
        lastRequest: new Date().toISOString(),
      },
    };
  }
}
