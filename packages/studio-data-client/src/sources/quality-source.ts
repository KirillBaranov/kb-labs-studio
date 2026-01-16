/**
 * QualityDataSource - Interface for monorepo quality analysis
 * Provides access to health metrics, dependency analysis, and build order information
 */

import type {
  StatsResponse,
  HealthResponse,
  DependenciesResponse,
  BuildOrderResponse,
  CyclesResponse,
  GraphResponse,
  GraphMode,
  StaleResponse,
} from '@kb-labs/quality-contracts';

export interface QualityDataSource {
  /**
   * Get monorepo statistics (packages, LOC, size)
   * @param includeHealth - Whether to include health score in response
   */
  getStats(includeHealth?: boolean): Promise<StatsResponse>;

  /**
   * Get monorepo health score and grade (A-F)
   * @param detailed - Whether to include detailed issues list
   */
  getHealth(detailed?: boolean): Promise<HealthResponse>;

  /**
   * Analyze dependencies: duplicates, unused, missing
   */
  getDependencies(): Promise<DependenciesResponse>;

  /**
   * Get build order for packages
   * @param packageName - Optional: get build order for specific package
   */
  getBuildOrder(packageName?: string): Promise<BuildOrderResponse>;

  /**
   * Detect circular dependencies
   */
  getCycles(): Promise<CyclesResponse>;

  /**
   * Get dependency graph visualization
   * @param mode - Visualization mode: 'tree' | 'reverse' | 'impact' | 'stats'
   * @param packageName - Optional: package to visualize
   */
  getGraph(mode: GraphMode, packageName?: string): Promise<GraphResponse>;

  /**
   * Detect stale packages that need rebuilding
   * @param detailed - Whether to include detailed critical chains analysis
   */
  getStale(detailed?: boolean): Promise<StaleResponse>;
}
