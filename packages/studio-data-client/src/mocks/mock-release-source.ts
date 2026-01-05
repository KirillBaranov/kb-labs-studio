/**
 * @module @kb-labs/studio-data-client/mocks/mock-release-source
 * Mock implementation of ReleaseDataSource for development
 */

import type { ReleaseDataSource } from '../sources/release-source';
import type {
  ScopesResponse,
  StatusResponse,
  PlanResponse,
  GeneratePlanRequest,
  GeneratePlanResponse,
  VerifyResponse,
  ChangelogResponse,
  GenerateChangelogRequest,
  GenerateChangelogResponse,
  SaveChangelogRequest,
  SaveChangelogResponse,
  RunReleaseRequest,
  RunReleaseResponse,
  PublishRequest,
  PublishResponse,
  RollbackRequest,
  RollbackResponse,
  ReportResponse,
  HistoryResponse,
  HistoryReportResponse,
  HistoryPlanResponse,
  HistoryChangelogResponse,
  GitTimelineResponse,
  ReleasePlan,
  ReleaseReport,
} from '@kb-labs/release-manager-contracts';

/**
 * Mock implementation of ReleaseDataSource
 */
export class MockReleaseSource implements ReleaseDataSource {
  private mockPlans = new Map<string, ReleasePlan>();
  private mockChangelogs = new Map<string, string>();
  private mockHistory: Array<{ id: string; timestamp: string; scope: string }> = [
    { id: 'rel-2024-01-15-001', timestamp: '2024-01-15T10:30:00Z', scope: 'root' },
    { id: 'rel-2024-01-10-001', timestamp: '2024-01-10T14:20:00Z', scope: '@kb-labs/workflow' },
    { id: 'rel-2024-01-05-001', timestamp: '2024-01-05T09:15:00Z', scope: '@kb-labs/mind-engine' },
  ];

  constructor() {
    // Initialize with mock plans
    this.mockPlans.set('root', {
      schemaVersion: '1.0',
      scope: 'root',
      packages: [
        {
          name: 'kb-labs',
          path: '/Users/dev/kb-labs',
          currentVersion: '1.0.0',
          nextVersion: '1.1.0',
          bump: 'minor',
          isPublished: false,
        },
      ],
      strategy: 'semver',
      registry: 'https://registry.npmjs.org',
      rollbackEnabled: true,
      createdAt: new Date().toISOString(),
    });

    this.mockPlans.set('@kb-labs/workflow', {
      schemaVersion: '1.0',
      scope: '@kb-labs/workflow',
      packages: [
        {
          name: '@kb-labs/workflow-runtime',
          path: '/Users/dev/kb-labs/kb-labs-workflow/packages/workflow-runtime',
          currentVersion: '0.5.2',
          nextVersion: '0.6.0',
          bump: 'minor',
          isPublished: false,
        },
        {
          name: '@kb-labs/workflow-cli',
          path: '/Users/dev/kb-labs/kb-labs-workflow/packages/workflow-cli',
          currentVersion: '0.5.2',
          nextVersion: '0.5.3',
          bump: 'patch',
          isPublished: false,
        },
      ],
      strategy: 'semver',
      registry: 'https://registry.npmjs.org',
      rollbackEnabled: true,
      createdAt: new Date().toISOString(),
    });

    // Initialize with mock changelogs
    this.mockChangelogs.set(
      '@kb-labs/workflow',
      `# Changelog

## [0.6.0] - 2024-01-16

### Added
- Job retry functionality with exponential backoff
- Better error messages for failed jobs

### Fixed
- CLI argument parsing for workflow:run command
- Memory leak in job executor

## [0.5.2] - 2024-01-10

### Fixed
- Workflow state persistence
`
    );
  }

  // === Scopes ===
  async getScopes(): Promise<ScopesResponse> {
    await this.delay(100);
    return {
      scopes: [
        {
          id: 'root',
          name: 'KB Labs',
          path: '/Users/dev/kb-labs',
          currentVersion: '1.0.0',
          description: 'KB Labs monorepo',
          type: 'root',
        },
        {
          id: '@kb-labs/workflow',
          name: 'Workflow',
          path: '/Users/dev/kb-labs/kb-labs-workflow',
          currentVersion: '0.5.2',
          description: 'Workflow engine and orchestration',
          type: 'monorepo',
        },
        {
          id: '@kb-labs/mind-engine',
          name: 'Mind Engine',
          path: '/Users/dev/kb-labs/kb-labs-mind/packages/mind-engine',
          currentVersion: '0.1.5',
          description: 'AI-powered code search engine',
          type: 'package',
        },
        {
          id: '@kb-labs/cli-core',
          name: 'CLI Core',
          path: '/Users/dev/kb-labs/kb-labs-cli/packages/cli-core',
          currentVersion: '0.3.1',
          description: 'Core CLI framework',
          type: 'package',
        },
      ],
    };
  }

  // === Status ===
  async getStatus(scope: string): Promise<StatusResponse> {
    await this.delay(80);
    const hasPlan = this.mockPlans.has(scope);
    const hasChangelog = this.mockChangelogs.has(scope);

    return {
      scope,
      hasPlan,
      hasReport: this.mockHistory.some((h) => h.scope === scope),
      hasChangelog,
      planStatus: hasPlan ? 'ready' : 'idle',
      packagesInPlan: hasPlan ? this.mockPlans.get(scope)!.packages.length : 0,
      lastReleaseAt: this.mockHistory.find((h) => h.scope === scope)?.timestamp,
    };
  }

  // === Plan ===
  async getPlan(scope: string): Promise<PlanResponse> {
    await this.delay(100);
    const plan = this.mockPlans.get(scope);

    if (!plan) {
      return { hasPlan: false, scope };
    }

    return { hasPlan: true, plan, scope };
  }

  async generatePlan(request: GeneratePlanRequest): Promise<GeneratePlanResponse> {
    await this.delay(2000); // Simulate LLM generation

    const plan: ReleasePlan = {
      schemaVersion: '1.0',
      scope: request.scope,
      packages: [
        {
          name: `${request.scope}/example`,
          path: `/Users/dev/kb-labs/${request.scope}/example`,
          currentVersion: '1.0.0',
          nextVersion: '1.1.0',
          bump: 'minor',
          isPublished: false,
        },
      ],
      strategy: 'semver',
      registry: 'https://registry.npmjs.org',
      rollbackEnabled: true,
      createdAt: new Date().toISOString(),
    };

    this.mockPlans.set(request.scope, plan);

    return {
      plan,
      planPath: `.kb/release/${request.scope}/plan.json`,
      scope: request.scope,
    };
  }

  async resetPlan(scope: string): Promise<{ success: boolean }> {
    await this.delay(50);
    this.mockPlans.delete(scope);
    this.mockChangelogs.delete(scope);
    return { success: true };
  }

  // === Preview ===
  async getPreview(scope: string): Promise<PlanResponse> {
    // Preview is same as getPlan in mock
    return this.getPlan(scope);
  }

  // === Verify ===
  async getVerify(scope: string): Promise<VerifyResponse> {
    await this.delay(500);
    return {
      scope,
      passed: true,
      checks: [
        { name: 'Version consistency', passed: true },
        { name: 'Dependency compatibility', passed: true },
        { name: 'Breaking change detection', passed: true, warning: 'No breaking changes detected' },
        { name: 'Build validation', passed: true },
      ],
      warnings: ['Consider updating peer dependencies'],
      errors: [],
    };
  }

  // === Changelog ===
  async getChangelog(
    scope: string,
    options?: { from?: string; to?: string }
  ): Promise<ChangelogResponse> {
    await this.delay(100);
    const markdown = this.mockChangelogs.get(scope);

    if (!markdown) {
      return {
        scope,
        from: options?.from,
        to: options?.to,
      };
    }

    return {
      scope,
      markdown,
      from: options?.from,
      to: options?.to,
      generatedAt: new Date().toISOString(),
    };
  }

  async generateChangelog(request: GenerateChangelogRequest): Promise<GenerateChangelogResponse> {
    await this.delay(2500); // Simulate LLM generation

    const markdown = `# Changelog

## [Unreleased]

### Added
- Mock generated changelog for ${request.scope}
- New features based on git history

### Fixed
- Various bug fixes

### Changed
- Updated dependencies
`;

    this.mockChangelogs.set(request.scope, markdown);

    return {
      scope: request.scope,
      markdown,
      changelogPath: `.kb/release/${request.scope}/CHANGELOG.md`,
      tokensUsed: 2100,
    };
  }

  async saveChangelog(request: SaveChangelogRequest): Promise<SaveChangelogResponse> {
    await this.delay(100);
    this.mockChangelogs.set(request.scope, request.markdown);
    return {
      success: true,
      scope: request.scope,
      path: `.kb/release/${request.scope}/CHANGELOG.md`,
    };
  }

  // === Release ===
  async runRelease(request: RunReleaseRequest): Promise<RunReleaseResponse> {
    await this.delay(3000); // Simulate release execution

    const plan = this.mockPlans.get(request.scope);
    if (!plan) {
      throw new Error(`No plan found for scope: ${request.scope}`);
    }

    // Mark packages as published
    plan.packages.forEach((pkg) => {
      pkg.isPublished = true;
    });

    const report: ReleaseReport = {
      schemaVersion: '1.0',
      ts: new Date().toISOString(),
      scope: request.scope,
      context: {
        repo: 'kb-labs',
        cwd: '/Users/dev/kb-labs',
        branch: 'main',
        profile: 'default',
        dryRun: request.dryRun || false,
      },
      stage: 'verifying',
      plan,
      result: {
        ok: true,
        timingMs: 2847,
        changelog: this.mockChangelogs.get(request.scope),
        published: plan.packages.map((p) => p.name),
        git: {
          committed: true,
          tagged: plan.packages.map((p) => `${p.name}@${p.nextVersion}`),
          pushed: true,
        },
      },
    };

    return {
      report,
      scope: request.scope,
      success: true,
      errors: [],
    };
  }

  async publish(request: PublishRequest): Promise<PublishResponse> {
    await this.delay(2000);

    return {
      scope: request.scope,
      success: true,
      published: request.packages || [],
      failed: [],
    };
  }

  async rollback(request: RollbackRequest): Promise<RollbackResponse> {
    await this.delay(1500);

    return {
      scope: request.scope,
      success: true,
      message: 'Rollback completed successfully',
      rolledBackPackages: ['@kb-labs/core', '@kb-labs/plugin'],
    };
  }

  // === Report ===
  async getReport(): Promise<ReportResponse> {
    await this.delay(100);

    if (this.mockHistory.length === 0) {
      return { hasReport: false };
    }

    const latest = this.mockHistory[0]!;
    const plan = this.mockPlans.get(latest.scope);

    const report: ReleaseReport = {
      schemaVersion: '1.0',
      ts: latest.timestamp,
      scope: latest.scope,
      context: {
        repo: 'kb-labs',
        cwd: '/Users/dev/kb-labs',
        branch: 'main',
      },
      stage: 'verifying',
      plan,
      result: {
        ok: true,
        timingMs: 3200,
        published: plan?.packages.map((p) => p.name) || [],
      },
    };

    return {
      hasReport: true,
      report,
      scope: latest.scope,
    };
  }

  // === History ===
  async getHistory(): Promise<HistoryResponse> {
    await this.delay(150);

    return {
      releases: this.mockHistory.map((h) => ({
        id: h.id,
        scope: h.scope,
        packages: [`${h.scope}/example`],
        success: true,
        stage: 'verifying' as const,
        timestamp: h.timestamp,
      })),
    };
  }

  async getHistoryReport(scope: string, id: string): Promise<HistoryReportResponse> {
    await this.delay(100);

    const historyEntry = this.mockHistory.find((h) => h.id === id && h.scope === scope);
    if (!historyEntry) {
      throw new Error(`Release not found: ${scope}/${id}`);
    }

    const plan = this.mockPlans.get(historyEntry.scope);

    const report: ReleaseReport = {
      schemaVersion: '1.0',
      ts: historyEntry.timestamp,
      scope: historyEntry.scope,
      context: {
        repo: 'kb-labs',
        cwd: '/Users/dev/kb-labs',
        branch: 'main',
      },
      stage: 'verifying',
      plan,
      result: {
        ok: true,
        timingMs: 3200,
        published: plan?.packages.map((p) => p.name) || [],
      },
    };

    return {
      report,
      id,
    };
  }

  async getHistoryPlan(scope: string, id: string): Promise<HistoryPlanResponse> {
    await this.delay(100);

    const historyEntry = this.mockHistory.find((h) => h.id === id && h.scope === scope);
    if (!historyEntry) {
      throw new Error(`Release not found: ${scope}/${id}`);
    }

    const plan: ReleasePlan = {
      schemaVersion: '1.0',
      scope: historyEntry.scope,
      packages: [
        {
          name: `${historyEntry.scope}/example`,
          path: `/Users/dev/kb-labs/${historyEntry.scope}/example`,
          currentVersion: '1.0.0',
          nextVersion: '1.1.0',
          bump: 'minor',
          isPublished: true,
        },
      ],
      strategy: 'semver',
      registry: 'https://registry.npmjs.org',
      rollbackEnabled: true,
      createdAt: new Date().toISOString(),
    };

    return {
      plan,
      id,
    };
  }

  async getHistoryChangelog(scope: string, id: string): Promise<HistoryChangelogResponse> {
    await this.delay(100);

    const historyEntry = this.mockHistory.find((h) => h.id === id && h.scope === scope);
    if (!historyEntry) {
      throw new Error(`Release not found: ${scope}/${id}`);
    }

    const markdown = `# Changelog for ${id}

## [1.1.0] - ${historyEntry.timestamp.split('T')[0]}

### Added
- Historical changelog entry
- Mock data for testing
`;

    return {
      markdown,
      id,
      scope: historyEntry.scope,
    };
  }

  // === Git Timeline ===
  async getGitTimeline(scope: string): Promise<GitTimelineResponse> {
    await this.delay(100);

    // Mock git timeline data
    const mockCommits = [
      {
        sha: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
        shortSha: 'a1b2c3d',
        message: 'feat(core): add new feature X',
        type: 'feat' as const,
        bump: 'minor' as const,
        scope: 'core',
        author: 'Developer',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        sha: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
        shortSha: 'b2c3d4e',
        message: 'fix: resolve critical bug',
        type: 'fix' as const,
        bump: 'patch' as const,
        author: 'Developer',
        date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        sha: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
        shortSha: 'c3d4e5f',
        message: 'chore: update dependencies',
        type: 'chore' as const,
        bump: 'none' as const,
        author: 'Developer',
        date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ];

    return {
      scope,
      currentVersion: '1.0.0',
      suggestedVersion: '1.1.0',
      suggestedBump: 'minor' as const,
      commits: mockCommits,
      unreleased: mockCommits.length,
      lastTag: 'v1.0.0',
      hasUnreleasedChanges: true,
    };
  }

  // === Helpers ===
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
