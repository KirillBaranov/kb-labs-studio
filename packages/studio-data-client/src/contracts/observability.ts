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
