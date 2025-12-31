/**
 * @module @kb-labs/studio-data-client/mocks/mock-observability-source
 * Mock implementation of ObservabilityDataSource
 */

import type { ObservabilityDataSource } from '../sources/observability-source';
import type { StateBrokerStats, DevKitHealth } from '../contracts/observability';

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
}
