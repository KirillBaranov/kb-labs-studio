/**
 * MockQualitySource - Mock implementation of QualityDataSource
 * Provides hard-coded test data for development and testing
 */

import type { QualityDataSource } from '../sources/quality-source.js';
import type {
  StatsResponse,
  HealthResponse,
  DependenciesResponse,
  BuildOrderResponse,
  CyclesResponse,
  GraphResponse,
  GraphMode,
} from '@kb-labs/quality-contracts';

export class MockQualitySource implements QualityDataSource {
  async getStats(includeHealth?: boolean): Promise<StatsResponse> {
    return {
      packages: 90,
      loc: 226514,
      size: '6.22 MB',
      health: includeHealth ? 68 : undefined,
      grade: includeHealth ? 'D' : undefined,
    };
  }

  async getHealth(detailed?: boolean): Promise<HealthResponse> {
    return {
      score: 68,
      grade: 'D',
      issues: detailed
        ? [
            {
              type: 'duplicates',
              severity: -20,
              description: '30 duplicate dependencies found',
              count: 30,
            },
            {
              type: 'missing-readme',
              severity: -12,
              description: '12 packages missing README',
              count: 12,
            },
          ]
        : undefined,
    };
  }

  async getDependencies(): Promise<DependenciesResponse> {
    return {
      duplicates: [
        {
          name: 'typescript',
          versions: ['5.9.3', '5.8.0'],
          packages: ['@kb-labs/cli', '@kb-labs/workflow'],
        },
        {
          name: 'react',
          versions: ['18.3.1', '18.2.0'],
          packages: ['@kb-labs/studio', '@kb-labs/ui'],
        },
      ],
      unused: [
        {
          name: 'lodash',
          packages: ['@kb-labs/cli'],
        },
        {
          name: 'axios',
          packages: ['@kb-labs/workflow'],
        },
      ],
      missing: [
        {
          name: '@kb-labs/core',
          packages: ['@kb-labs/cli'],
          importedIn: ['src/cli/commands/build.ts'],
        },
      ],
      totalIssues: 5,
    };
  }

  async getBuildOrder(packageName?: string): Promise<BuildOrderResponse> {
    if (packageName) {
      return {
        layers: [
          ['@kb-labs/contracts'],
          ['@kb-labs/core'],
          ['@kb-labs/cli'],
          [packageName],
        ],
        sorted: ['@kb-labs/contracts', '@kb-labs/core', '@kb-labs/cli', packageName],
        circular: [],
        packageCount: 4,
        layerCount: 4,
        hasCircular: false,
      };
    }

    return {
      layers: [
        ['@kb-labs/contracts', '@kb-labs/shared'],
        ['@kb-labs/core'],
        ['@kb-labs/cli', '@kb-labs/workflow'],
        ['@kb-labs/plugin', '@kb-labs/studio'],
      ],
      sorted: [
        '@kb-labs/contracts',
        '@kb-labs/shared',
        '@kb-labs/core',
        '@kb-labs/cli',
        '@kb-labs/workflow',
        '@kb-labs/plugin',
        '@kb-labs/studio',
      ],
      circular: [],
      packageCount: 7,
      layerCount: 4,
      hasCircular: false,
    };
  }

  async getCycles(): Promise<CyclesResponse> {
    return {
      cycles: [
        ['@kb-labs/plugin-runtime', '@kb-labs/plugin-execution', '@kb-labs/core-runtime'],
      ],
      count: 1,
      hasCircular: true,
      affected: [
        '@kb-labs/plugin-runtime',
        '@kb-labs/plugin-execution',
        '@kb-labs/core-runtime',
      ],
    };
  }

  async getGraph(mode: GraphMode, packageName?: string): Promise<GraphResponse> {
    if (mode === 'tree') {
      return {
        mode: 'tree',
        packageName,
        tree: {
          name: packageName || '@kb-labs/studio',
          children: [
            {
              name: '@kb-labs/core',
              children: [{ name: '@kb-labs/contracts' }],
            },
            {
              name: '@kb-labs/ui',
              children: [
                { name: 'react' },
                { name: 'react-dom' },
              ],
            },
          ],
        },
      };
    }

    if (mode === 'reverse') {
      return {
        mode: 'reverse',
        packageName,
        packages: ['@kb-labs/studio', '@kb-labs/cli', '@kb-labs/workflow'],
      };
    }

    if (mode === 'impact') {
      return {
        mode: 'impact',
        packageName,
        packages: ['@kb-labs/plugin', '@kb-labs/studio', '@kb-labs/workflow'],
      };
    }

    // mode === 'stats'
    return {
      mode: 'stats',
      stats: {
        totalPackages: 90,
        maxDepth: 8,
        avgDependencies: 4.2,
        mostDepended: [
          { name: '@kb-labs/core', count: 45 },
          { name: '@kb-labs/contracts', count: 38 },
          { name: 'typescript', count: 90 },
        ],
      },
    };
  }
}
