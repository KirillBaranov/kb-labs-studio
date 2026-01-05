/**
 * @module @kb-labs/studio-data-client/mocks/mock-observability-source
 * Mock implementation of ObservabilityDataSource
 */

import type { ObservabilityDataSource } from '../sources/observability-source';
import type { StateBrokerStats, DevKitHealth, PrometheusMetrics, SystemEvent, LogRecord, LogQuery, LogQueryResponse, LogSummarizeRequest, LogSummarizeResponse } from '../contracts/observability';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock implementation of ObservabilityDataSource
 *
 * Returns deterministic mock data for development and testing
 */
export class MockObservabilitySource implements ObservabilityDataSource {
  async getStateBrokerStats(): Promise<StateBrokerStats> {
    await delay(150);

    return {
      uptime: 3_600_000, // 1 hour
      totalEntries: 42,
      totalSize: 10_240, // 10KB
      hitRate: 0.85,
      missRate: 0.15,
      evictions: 5,
      namespaces: {
        mind: {
          entries: 20,
          hits: 100,
          misses: 10,
          size: 5_120,
        },
        workflow: {
          entries: 15,
          hits: 80,
          misses: 5,
          size: 3_072,
        },
        plugin: {
          entries: 7,
          hits: 30,
          misses: 2,
          size: 2_048,
        },
      },
    };
  }

  async getDevKitHealth(): Promise<DevKitHealth> {
    await delay(200);

    return {
      healthScore: 68,
      grade: 'D',
      issues: {
        duplicateDeps: 30,
        missingReadmes: 12,
        typeErrors: 3012,
        brokenImports: 5,
        unusedExports: 120,
      },
      packages: 91,
      avgTypeCoverage: 91.1,
    };
  }

  async getPrometheusMetrics(): Promise<PrometheusMetrics> {
    await delay(180);

    const now = Date.now();
    const startTime = now - 7_200_000; // 2 hours ago

    return {
      requests: {
        total: 1542,
        success: 1489,
        clientErrors: 38,
        serverErrors: 15,
      },
      latency: {
        average: 47.3,
        min: 3.2,
        max: 892.5,
        p50: 38.1,
        p95: 125.7,
        p99: 287.4,
      },
      perPlugin: [
        {
          pluginId: 'workflow',
          requests: 523,
          errors: 12,
          latency: {
            average: 52.1,
            min: 5.3,
            max: 345.2,
          },
        },
        {
          pluginId: 'mind',
          requests: 387,
          errors: 8,
          latency: {
            average: 68.5,
            min: 12.1,
            max: 892.5,
          },
        },
        {
          pluginId: 'commit',
          requests: 142,
          errors: 3,
          latency: {
            average: 35.2,
            min: 8.7,
            max: 156.3,
          },
        },
      ],
      perTenant: [
        {
          tenantId: 'default',
          requests: 1542,
          errors: 53,
          latency: {
            average: 47.3,
          },
        },
      ],
      errors: {
        byStatusCode: {
          400: 12,
          404: 18,
          422: 8,
          500: 10,
          503: 5,
        },
        recent: [
          {
            timestamp: now - 120_000,
            statusCode: 500,
            errorCode: 'INTERNAL_ERROR',
            message: 'Database connection timeout',
          },
          {
            timestamp: now - 300_000,
            statusCode: 404,
            message: 'Resource not found',
          },
          {
            timestamp: now - 450_000,
            statusCode: 422,
            errorCode: 'VALIDATION_ERROR',
            message: 'Invalid request payload',
          },
        ],
      },
      timestamps: {
        startTime,
        lastRequest: now - 2_500,
      },
      redis: {
        updates: 342,
        healthyTransitions: 2,
        unhealthyTransitions: 1,
        lastStatus: {
          healthy: true,
          state: 'ready',
          role: 'master',
        },
      },
      pluginMounts: {
        total: 8,
        succeeded: 7,
        failed: 1,
        elapsedMs: 1247,
      },
      uptime: {
        seconds: 7200,
        startTime: new Date(startTime).toISOString(),
        lastRequest: new Date(now - 2_500).toISOString(),
      },
    };
  }

  async queryLogs(filters: LogQuery): Promise<LogQueryResponse> {
    await delay(200);

    const now = Date.now();
    const oldest = new Date(now - 3_600_000).toISOString(); // 1 hour ago
    const newest = new Date(now).toISOString();

    // Generate mock log records
    const mockLogs: LogRecord[] = Array.from({ length: filters.limit || 20 }, (_, i) => ({
      time: new Date(now - i * 60_000).toISOString(),
      level: ['info', 'warn', 'error'][i % 3] as 'info' | 'warn' | 'error',
      msg: `Mock log entry ${i + 1}`,
      plugin: filters.plugin || ['rest-api', 'workflow', 'mind'][i % 3],
      executionId: filters.executionId || `exec-${i}`,
      tenantId: filters.tenantId || 'default',
      meta: { mockData: true, index: i },
    }));

    return {
      ok: true,
      data: {
        logs: mockLogs,
        total: 42,
        filters,
        bufferStats: {
          size: mockLogs.length,
          maxSize: 1000,
          oldest,
          newest,
        },
      },
    };
  }

  subscribeToSystemEvents(
    onEvent: (event: SystemEvent) => void,
    _onError: (error: Error) => void
  ): () => void {
    // Simulate periodic events in mock mode
    const interval = setInterval(() => {
      const now = Date.now();

      // Alternate between health and registry events
      if (Math.random() > 0.5) {
        onEvent({
          type: 'health',
          status: 'healthy',
          ts: new Date(now).toISOString(),
          ready: true,
          reason: null,
          registryPartial: false,
          registryStale: false,
          registryLoaded: true,
          pluginMountInProgress: false,
          pluginRoutesMounted: true,
          pluginsMounted: 7,
          pluginsFailed: 1,
          lastPluginMountTs: new Date(now - 60000).toISOString(),
          pluginRoutesLastDurationMs: 1247,
          redisEnabled: true,
          redisHealthy: true,
        });
      } else {
        onEvent({
          type: 'registry',
          rev: Math.random().toString(36).substring(7),
          generatedAt: new Date(now).toISOString(),
          partial: false,
          stale: false,
          expiresAt: new Date(now + 300000).toISOString(),
          ttlMs: 300000,
          checksum: Math.random().toString(36).substring(2, 15),
          checksumAlgorithm: 'sha256',
          previousChecksum: null,
        });
      }
    }, 3000); // Event every 3 seconds

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }

  subscribeToLogs(
    onLog: (log: LogRecord) => void,
    _onError: (error: Error) => void,
    filters?: LogQuery
  ): () => void {
    // Simulate periodic log events in mock mode
    let counter = 0;
    const interval = setInterval(() => {
      const now = Date.now();
      onLog({
        time: new Date(now).toISOString(),
        level: ['info', 'warn', 'error'][counter % 3] as 'info' | 'warn' | 'error',
        msg: `Mock live log ${counter + 1}`,
        plugin: filters?.plugin || ['rest-api', 'workflow', 'mind'][counter % 3],
        executionId: filters?.executionId || `exec-${counter}`,
        tenantId: filters?.tenantId || 'default',
        meta: { mockData: true, counter },
      });
      counter++;
    }, 2000); // Log every 2 seconds

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  }

  async summarizeLogs(request: LogSummarizeRequest): Promise<LogSummarizeResponse> {
    await delay(1500); // Simulate LLM processing time

    return {
      ok: true,
      data: {
        summary: {
          question: request.question,
          timeRange: {
            from: request.timeRange?.from || null,
            to: request.timeRange?.to || null,
          },
          total: 42,
          stats: {
            total: 42,
            byLevel: {
              error: 3,
              warn: 5,
              info: 34,
            },
            byPlugin: {
              'rest-api': 20,
              'workflow': 15,
              'mind': 7,
            },
            topErrors: [
              { message: 'Connection timeout', count: 2 },
              { message: 'Invalid parameter', count: 1 },
            ],
            timeRange: {
              from: request.timeRange?.from || null,
              to: request.timeRange?.to || null,
            },
          },
          groups: null,
        },
        aiSummary: `## Mock AI Summary

Based on the analysis of ${42} log entries:

**Key Findings:**
- Total of 3 errors and 5 warnings detected
- Most active component: rest-api (20 logs)
- Primary issue: Connection timeouts (2 occurrences)

**Timeline:**
The system has been mostly stable with info-level logs. Two connection timeout errors were observed, likely related to external service availability.

**Recommendations:**
1. Investigate network connectivity to external services
2. Consider implementing retry logic with exponential backoff
3. Monitor timeout patterns over next 24 hours

*Note: This is mock data from MockObservabilitySource*`,
        message: null,
      },
    };
  }
}
