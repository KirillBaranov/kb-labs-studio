/**
 * @module @kb-labs/studio-data-client/contracts/observability
 * Observability contracts for Studio
 */

/**
 * State Broker statistics
 */
export interface StateBrokerStats {
  /** Daemon uptime in milliseconds */
  uptime: number;

  /** Total number of cache entries */
  totalEntries: number;

  /** Total cache size in bytes */
  totalSize: number;

  /** Cache hit rate (0-1) */
  hitRate: number;

  /** Cache miss rate (0-1) */
  missRate: number;

  /** Number of evicted entries */
  evictions: number;

  /** Stats per namespace */
  namespaces: Record<string, NamespaceStats>;
}

/**
 * Namespace-level statistics
 */
export interface NamespaceStats {
  /** Number of entries */
  entries: number;

  /** Cache hits */
  hits: number;

  /** Cache misses */
  misses: number;

  /** Size in bytes */
  size: number;
}

/**
 * DevKit health snapshot
 */
export interface DevKitHealth {
  /** Health score (0-100) */
  healthScore: number;

  /** Letter grade (A-F) */
  grade: 'A' | 'B' | 'C' | 'D' | 'F';

  /** Issues breakdown */
  issues: {
    duplicateDeps?: number;
    missingReadmes?: number;
    typeErrors?: number;
    brokenImports?: number;
    unusedExports?: number;
    [key: string]: number | undefined;
  };

  /** Total packages */
  packages: number;

  /** Average type coverage percentage */
  avgTypeCoverage?: number;
}

/**
 * Prometheus metrics from REST API
 */
export interface PrometheusMetrics {
  /** Request statistics */
  requests: {
    total: number;
    success: number;
    clientErrors: number;
    serverErrors: number;
  };

  /** Latency statistics */
  latency: {
    average: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };

  /** Per-plugin metrics */
  perPlugin: Array<{ pluginId: string } & PluginMetrics>;

  /** Per-tenant metrics */
  perTenant: Array<{ tenantId: string } & TenantMetrics>;

  /** Error breakdown */
  errors: {
    byStatusCode: Record<number, number>;
    recent: Array<{
      timestamp: number;
      statusCode: number;
      errorCode?: string;
      message: string;
    }>;
  };

  /** Timestamps */
  timestamps: {
    startTime: number;
    lastRequest: number | null;
  };

  /** Redis statistics */
  redis: {
    updates: number;
    healthyTransitions: number;
    unhealthyTransitions: number;
    lastStatus: {
      healthy: boolean;
      state: string;
      role: string;
    } | null;
  };

  /** Plugin mount snapshot */
  pluginMounts: {
    total: number;
    succeeded: number;
    failed: number;
    elapsedMs: number;
  } | null;

  /** Uptime information */
  uptime: {
    seconds: number;
    startTime: string;
    lastRequest: string | null;
  };
}

/**
 * Plugin-level metrics
 */
export interface PluginMetrics {
  requests: number;
  errors: number;
  latency: {
    average: number;
    min: number;
    max: number;
  };
}

/**
 * Tenant-level metrics
 */
export interface TenantMetrics {
  requests: number;
  errors: number;
  latency: {
    average: number;
  };
}

/**
 * System event from /events/registry SSE stream
 */
export type SystemEvent = RegistryEvent | HealthEvent;

/**
 * Registry snapshot event
 */
export interface RegistryEvent {
  type: 'registry';
  rev: string;
  generatedAt: string;
  partial: boolean;
  stale: boolean;
  expiresAt: string | null;
  ttlMs: number | null;
  checksum?: string;
  checksumAlgorithm?: 'sha256';
  previousChecksum: string | null;
}

/**
 * Health status event
 */
export interface HealthEvent {
  type: 'health';
  status: 'healthy' | 'unhealthy';
  ts: string;
  ready: boolean;
  reason: string | null;
  registryPartial: boolean;
  registryStale: boolean;
  registryLoaded: boolean;
  pluginMountInProgress: boolean;
  pluginRoutesMounted: boolean;
  pluginsMounted: number;
  pluginsFailed: number;
  lastPluginMountTs: string | null;
  pluginRoutesLastDurationMs: number | null;
  redisEnabled: boolean;
  redisHealthy: boolean;
  redisStates?: Array<{ role: string; state: string }>;
}
