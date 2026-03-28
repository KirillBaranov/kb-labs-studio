/**
 * @module @kb-labs/studio-data-client/mocks/mock-qa-source
 * Mock implementation of QADataSource for development mode
 */

import type {
  QADataSource,
  QASummaryResponse,
  QAHistoryResponse,
  QATrendsResponse,
  QAEnrichedTrendsResponse,
  QABaselineResponse,
  QARunResultResponse,
  QADetailsResponse,
  QARunCheckOptions,
  QARunCheckResponse,
  QABaselineUpdateResponse,
  QABaselineDiffResponse,
  QAPackageTimelineResponse,
  QAErrorGroupsResponse,
} from '../sources/qa-source.js';
import type { HistoryEntry, RegressionResult, EnrichedTrendResult } from '@kb-labs/qa-contracts';

const MOCK_HISTORY: HistoryEntry[] = [
  {
    timestamp: '2026-02-24T10:30:00Z',
    git: { commit: '0be7dd1', branch: 'main', message: 'chore: update baseline after fixes' },
    status: 'failed',
    summary: {
      build: { passed: 100, failed: 1, skipped: 24 },
      lint: { passed: 72, failed: 53, skipped: 0 },
      typeCheck: { passed: 62, failed: 63, skipped: 0 },
      test: { passed: 80, failed: 45, skipped: 0 },
    },
    failedPackages: {
      build: ['@kb-labs/plugin-template-core'],
      lint: ['@kb-labs/agents', '@kb-labs/cli', '@kb-labs/workflow-runtime'],
      typeCheck: ['@kb-labs/adapters', '@kb-labs/workflow-runtime', '@kb-labs/plugin-runtime'],
      test: ['@kb-labs/adapters-sqlite', '@kb-labs/agent-cli'],
    },
  },
  {
    timestamp: '2026-02-23T15:00:00Z',
    git: { commit: 'ac4c3e2', branch: 'main', message: 'chore: update submodules' },
    status: 'failed',
    summary: {
      build: { passed: 101, failed: 0, skipped: 24 },
      lint: { passed: 70, failed: 55, skipped: 0 },
      typeCheck: { passed: 60, failed: 65, skipped: 0 },
      test: { passed: 78, failed: 47, skipped: 0 },
    },
    failedPackages: {
      build: [],
      lint: ['@kb-labs/agents', '@kb-labs/cli', '@kb-labs/workflow-runtime', '@kb-labs/sdk'],
      typeCheck: ['@kb-labs/adapters', '@kb-labs/workflow-runtime', '@kb-labs/plugin-runtime'],
      test: ['@kb-labs/adapters-sqlite', '@kb-labs/agent-cli', '@kb-labs/mind-engine'],
    },
  },
  {
    timestamp: '2026-02-22T09:00:00Z',
    git: { commit: 'f844d72', branch: 'main', message: 'chore: mass eslint fix' },
    status: 'failed',
    summary: {
      build: { passed: 101, failed: 0, skipped: 24 },
      lint: { passed: 68, failed: 57, skipped: 0 },
      typeCheck: { passed: 58, failed: 67, skipped: 0 },
      test: { passed: 76, failed: 49, skipped: 0 },
    },
    failedPackages: {
      build: [],
      lint: ['@kb-labs/agents', '@kb-labs/cli'],
      typeCheck: ['@kb-labs/adapters', '@kb-labs/workflow-runtime'],
      test: ['@kb-labs/adapters-sqlite'],
    },
  },
];

export class MockQASource implements QADataSource {
  async getSummary(): Promise<QASummaryResponse> {
    const latest = MOCK_HISTORY[0]!;
    const build = latest.summary.build!;
    const lint = latest.summary.lint!;
    const typeCheck = latest.summary.typeCheck!;
    const test = latest.summary.test!;
    return {
      status: latest.status,
      lastRunAt: latest.timestamp,
      git: latest.git,
      checks: [
        { checkType: 'build', label: 'Build', ...build, total: build.passed + build.failed + build.skipped },
        { checkType: 'lint', label: 'Lint', ...lint, total: lint.passed + lint.failed + lint.skipped },
        { checkType: 'typeCheck', label: 'Type Check', ...typeCheck, total: typeCheck.passed + typeCheck.failed + typeCheck.skipped },
        { checkType: 'test', label: 'Tests', ...test, total: test.passed + test.failed + test.skipped },
      ],
      hasBaseline: true,
      baselineTimestamp: '2026-02-20T10:00:00Z',
      historyCount: MOCK_HISTORY.length,
    };
  }

  async getLatest(): Promise<{ entry: HistoryEntry | null }> {
    return { entry: MOCK_HISTORY[0] ?? null };
  }

  async getHistory(limit?: number): Promise<QAHistoryResponse> {
    const entries = limit ? MOCK_HISTORY.slice(0, limit) : MOCK_HISTORY;
    return { entries, total: MOCK_HISTORY.length };
  }

  async getTrends(window?: number): Promise<QATrendsResponse> {
    return {
      trends: [
        { checkType: 'build', previous: 0, current: 1, delta: 1, trend: 'regression' },
        { checkType: 'lint', previous: 57, current: 53, delta: -4, trend: 'improvement' },
        { checkType: 'typeCheck', previous: 67, current: 63, delta: -4, trend: 'improvement' },
        { checkType: 'test', previous: 49, current: 45, delta: -4, trend: 'improvement' },
      ],
      historyCount: MOCK_HISTORY.length,
      window: window ?? 10,
    };
  }

  async getEnrichedTrends(window?: number): Promise<QAEnrichedTrendsResponse> {
    const entries = MOCK_HISTORY;
    const first = entries[entries.length - 1]!;
    const last = entries[0]!;

    const buildEnriched = (ct: 'build' | 'lint' | 'typeCheck' | 'test'): EnrichedTrendResult => {
      const timeSeries = entries.map((e) => {
        const s = e.summary[ct]!;
        return {
          timestamp: e.timestamp,
          gitCommit: e.git.commit,
          gitBranch: e.git.branch,
          gitMessage: e.git.message,
          passed: s.passed,
          failed: s.failed,
          skipped: s.skipped,
        };
      }).reverse();

      const changelog = [];
      for (let i = 1; i < entries.length; i++) {
        const prev = entries[i]!;
        const curr = entries[i - 1]!;
        const prevSet = new Set(prev.failedPackages[ct] ?? []);
        const currFailed = curr.failedPackages[ct] ?? [];
        const currSet = new Set(currFailed);
        const newFailures = currFailed.filter((p) => !prevSet.has(p));
        const fixed = [...prevSet].filter((p) => !currSet.has(p));
        if (newFailures.length > 0 || fixed.length > 0) {
          changelog.push({
            timestamp: curr.timestamp,
            gitCommit: curr.git.commit,
            gitMessage: curr.git.message,
            newFailures,
            fixed,
            delta: currFailed.length - prevSet.size,
          });
        }
      }

      const previous = first.summary[ct]!.failed;
      const current = last.summary[ct]!.failed;
      const delta = current - previous;

      return {
        checkType: ct,
        timeSeries,
        changelog,
        current,
        previous,
        delta,
        trend: delta > 0 ? 'regression' : delta < 0 ? 'improvement' : 'no-change',
        velocity: Math.round((delta / Math.max(entries.length - 1, 1)) * 100) / 100,
      };
    };

    return {
      trends: [
        buildEnriched('build'),
        buildEnriched('lint'),
        buildEnriched('typeCheck'),
        buildEnriched('test'),
      ],
      historyCount: entries.length,
      window: window ?? 10,
    };
  }

  async getRegressions(): Promise<RegressionResult> {
    return {
      hasRegressions: true,
      regressions: [
        {
          checkType: 'build',
          delta: 1,
          newFailures: ['@kb-labs/plugin-template-core'],
        },
      ],
    };
  }

  async getBaseline(): Promise<QABaselineResponse> {
    return {
      baseline: {
        timestamp: '2026-02-20T10:00:00Z',
        git: { commit: '7934b57', branch: 'main' },
        results: {
          build: { passed: 101, failed: 0, failedPackages: [] },
          lint: { passed: 70, failed: 55, failedPackages: ['@kb-labs/agents', '@kb-labs/cli'] },
          typeCheck: { passed: 60, failed: 65, failedPackages: ['@kb-labs/adapters', '@kb-labs/workflow-runtime'] },
          test: { passed: 78, failed: 47, failedPackages: ['@kb-labs/adapters-sqlite'] },
        },
      },
    };
  }

  async runQA(): Promise<QARunResultResponse> {
    await new Promise<void>((resolve) => { setTimeout(resolve, 2000); });
    const latest = MOCK_HISTORY[0]!;
    return {
      status: 'failed',
      results: {
        build: { passed: ['@kb-labs/core'], failed: ['@kb-labs/plugin-template-core'], skipped: [], errors: {} },
        lint: { passed: ['@kb-labs/core'], failed: ['@kb-labs/agents'], skipped: [], errors: { '@kb-labs/agents': '1:1  error  @typescript-eslint/no-explicit-any  Unexpected any' } },
        typeCheck: { passed: ['@kb-labs/core'], failed: ['@kb-labs/adapters'], skipped: [], errors: { '@kb-labs/adapters': 'src/index.ts(12,5): error TS2345: Argument of type...' } },
        test: { passed: ['@kb-labs/core'], failed: ['@kb-labs/adapters-sqlite'], skipped: [], errors: { '@kb-labs/adapters-sqlite': 'FAIL packages/adapters-sqlite/src/store.test.ts' } },
      },
      entry: latest,
      durationMs: 2000,
    };
  }

  async getDetails(): Promise<QADetailsResponse> {
    return {
      timestamp: '2026-02-24T10:30:00Z',
      git: { commit: '0be7dd1', branch: 'main', message: 'chore: update baseline' },
      checks: {
        build: {
          passed: [{ name: '@kb-labs/core', repo: 'kb-labs-core', status: 'passed' }],
          failed: [{ name: '@kb-labs/plugin-template-core', repo: 'kb-labs-plugin-template', status: 'failed', error: 'Build failed: Cannot find module...' }],
          skipped: [],
        },
        lint: {
          passed: [{ name: '@kb-labs/core', repo: 'kb-labs-core', status: 'passed' }],
          failed: [{ name: '@kb-labs/agents', repo: 'kb-labs-agents', status: 'failed', error: '@typescript-eslint/no-explicit-any' }],
          skipped: [],
        },
        typeCheck: {
          passed: [{ name: '@kb-labs/core', repo: 'kb-labs-core', status: 'passed' }],
          failed: [{ name: '@kb-labs/adapters', repo: 'kb-labs-core', status: 'failed', error: 'TS2345: Argument of type...' }],
          skipped: [],
        },
        test: {
          passed: [{ name: '@kb-labs/core', repo: 'kb-labs-core', status: 'passed' }],
          failed: [{ name: '@kb-labs/adapters-sqlite', repo: 'kb-labs-core', status: 'failed', error: 'FAIL store.test.ts' }],
          skipped: [],
        },
      },
    };
  }

  async runCheck(options: QARunCheckOptions): Promise<QARunCheckResponse> {
    await new Promise<void>((resolve) => { setTimeout(resolve, 1000); });
    return {
      checkType: options.checkType,
      status: 'failed',
      result: {
        passed: ['@kb-labs/core'],
        failed: ['@kb-labs/agents'],
        skipped: [],
        errors: { '@kb-labs/agents': 'Mock error output' },
      },
      durationMs: 1000,
    };
  }

  async updateBaseline(): Promise<QABaselineUpdateResponse> {
    return {
      success: true,
      baseline: {
        timestamp: new Date().toISOString(),
        git: { commit: '0be7dd1', branch: 'main' },
        results: {
          build: { passed: 100, failed: 1, failedPackages: ['@kb-labs/plugin-template-core'] },
          lint: { passed: 72, failed: 53, failedPackages: ['@kb-labs/agents'] },
          typeCheck: { passed: 62, failed: 63, failedPackages: ['@kb-labs/adapters'] },
          test: { passed: 80, failed: 45, failedPackages: ['@kb-labs/adapters-sqlite'] },
        },
      },
    };
  }

  async getBaselineDiff(): Promise<QABaselineDiffResponse> {
    return {
      hasDiff: true,
      diff: {
        build: { newFailures: ['@kb-labs/plugin-template-core'], fixed: [], stillFailing: [], delta: 1 },
        lint: { newFailures: [], fixed: ['@kb-labs/sdk'], stillFailing: ['@kb-labs/agents'], delta: -1 },
        typeCheck: { newFailures: [], fixed: [], stillFailing: ['@kb-labs/adapters'], delta: 0 },
        test: { newFailures: [], fixed: ['@kb-labs/mind-engine'], stillFailing: ['@kb-labs/adapters-sqlite'], delta: -1 },
      },
      baseline: {
        timestamp: '2026-02-20T10:00:00Z',
        git: { commit: '7934b57', branch: 'main' },
        results: {
          build: { passed: 101, failed: 0, failedPackages: [] },
          lint: { passed: 70, failed: 55, failedPackages: ['@kb-labs/agents', '@kb-labs/sdk'] },
          typeCheck: { passed: 60, failed: 65, failedPackages: ['@kb-labs/adapters'] },
          test: { passed: 78, failed: 47, failedPackages: ['@kb-labs/adapters-sqlite', '@kb-labs/mind-engine'] },
        },
      },
      current: {
        timestamp: '2026-02-24T10:30:00Z',
        summary: {
          build: { passed: 100, failed: 1 },
          lint: { passed: 72, failed: 53 },
          typeCheck: { passed: 62, failed: 63 },
          test: { passed: 80, failed: 45 },
        },
      },
    };
  }

  async getPackageTimeline(packageName: string): Promise<QAPackageTimelineResponse> {
    return {
      packageName,
      repo: 'kb-labs-core',
      entries: MOCK_HISTORY.map((h) => ({
        timestamp: h.timestamp,
        git: h.git,
        checks: {
          build: (h.failedPackages.build ?? []).includes(packageName) ? 'failed' as const : 'passed' as const,
          lint: (h.failedPackages.lint ?? []).includes(packageName) ? 'failed' as const : 'passed' as const,
          typeCheck: (h.failedPackages.typeCheck ?? []).includes(packageName) ? 'failed' as const : 'passed' as const,
          test: (h.failedPackages.test ?? []).includes(packageName) ? 'failed' as const : 'passed' as const,
        },
      })),
      flakyScore: 0.15,
      flakyChecks: ['lint'],
      firstFailure: '2026-02-22T09:00:00Z',
      currentStreak: { status: 'failing', count: 2 },
    };
  }

  async getErrorGroups(): Promise<QAErrorGroupsResponse> {
    return {
      groups: [
        { pattern: '@typescript-eslint/no-explicit-any', count: 12, packages: ['@kb-labs/agents', '@kb-labs/cli', '@kb-labs/sdk'], checkType: 'lint', example: '1:1  error  @typescript-eslint/no-explicit-any  Unexpected any' },
        { pattern: 'TS2345', count: 8, packages: ['@kb-labs/adapters', '@kb-labs/workflow-runtime'], checkType: 'typeCheck', example: 'error TS2345: Argument of type...' },
        { pattern: '@typescript-eslint/no-unused-vars', count: 6, packages: ['@kb-labs/core', '@kb-labs/plugin-runtime'], checkType: 'lint', example: '5:10  error  @typescript-eslint/no-unused-vars' },
      ],
      ungrouped: 15,
    };
  }
}
