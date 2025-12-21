/**
 * @module @kb-labs/studio-data-client/sources/metrics-source
 * Metrics data source interface
 */

export interface MetricsSnapshot {
  requests: {
    total: number;
    byMethod: Record<string, number>;
    byStatus: Record<string, number>;
    byRoute: Record<string, number>;
    byTenant: Record<string, number>;
  };
  latency: {
    total: number;
    count: number;
    min: number;
    max: number;
    average: number;
    p50: number;
    p95: number;
    p99: number;
    histogram: Array<{
      route: string;
      count: number;
      total: number;
      max: number;
      byStatus: Record<string, number>;
      budgetMs: number | null;
      pluginId?: string;
    }>;
  };
  perPlugin: Array<{
    pluginId?: string;
    total: number;
    totalDuration: number;
    maxDuration: number;
    statuses: Record<string, number>;
  }>;
  perTenant: Array<{
    tenantId: string;
    total: number;
    errors: number;
    avgLatencyMs: number;
  }>;
  errors: {
    total: number;
    byCode: Record<string, number>;
  };
  timestamps: {
    startTime: number;
    lastRequest: number;
  };
  headers: {
    filteredInbound: number;
    filteredOutbound: number;
    sensitiveInbound: number;
    validationErrors: number;
    varyApplied: number;
    dryRunDecisions: number;
    perPlugin: Array<{
      pluginId: string;
      filteredInbound: number;
      filteredOutbound: number;
      validationErrors: number;
      varyApplied: number;
      sensitiveInbound: number;
    }>;
  };
  redis: {
    updates: number;
    healthyTransitions: number;
    unhealthyTransitions: number;
    lastUpdateTs: number | null;
    lastHealthyTs: number | null;
    lastUnhealthyTs: number | null;
    lastStatus: {
      enabled: boolean;
      healthy: boolean;
      roles: Record<string, string | null>;
    } | null;
    roleStates: Array<{
      role: string;
      states: Array<{ state: string; count: number }>;
    }>;
  };
  uptime?: {
    seconds: number;
    startTime: string;
    lastRequest: string | null;
  };
  pluginMounts?: {
    total: number;
    succeeded: number;
    failed: number;
    elapsedMs: number;
  } | null;
}

/**
 * Metrics data source interface
 */
export interface MetricsDataSource {
  /**
   * Get metrics snapshot
   */
  getMetrics(): Promise<MetricsSnapshot>;
}
