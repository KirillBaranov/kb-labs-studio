/**
 * @module @kb-labs/studio-data-client/mocks/mock-commit-source
 * Mock implementation of CommitDataSource
 *
 * TODO: TEMPORARY - Remove after commit plugin UI is polished and re-enabled in manifest
 * This is a temporary solution to provide custom commit page while widget UI is being improved
 */

import type { CommitDataSource } from '../sources/commit-source';
import type {
  ScopesResponse,
  StatusResponse,
  GenerateRequest,
  GenerateResponse,
  PlanResponse,
  PatchPlanRequest,
  PatchPlanResponse,
  RegenerateCommitRequest,
  RegenerateCommitResponse,
  ApplyRequest,
  ApplyResponse,
  PushRequest,
  PushResponse,
  ResetResponse,
  GitStatusResponse,
  FileDiffResponse,
  SummarizeRequest,
  SummarizeResponse,
} from '@kb-labs/commit-contracts';

/**
 * Mock implementation of CommitDataSource
 */
export class MockCommitSource implements CommitDataSource {
  async getScopes(): Promise<ScopesResponse> {
    return {
      scopes: [
        {
          id: 'kb-labs',
          name: 'KB Labs',
          path: '/Users/user/Desktop/kb-labs',
          description: 'Main monorepo',
        },
      ],
    };
  }

  async getStatus(scope?: string): Promise<StatusResponse> {
    return {
      scope: scope ?? 'root',
      hasPlan: false,
      planStatus: 'idle',
      filesChanged: 0,
      commitsInPlan: 0,
      commitsApplied: 0,
    };
  }

  async getPlan(scope?: string): Promise<PlanResponse> {
    return {
      hasPlan: false,
      scope: scope ?? 'root',
    };
  }

  async getGitStatus(scope?: string): Promise<GitStatusResponse> {
    return {
      scope: scope ?? 'root',
      status: {
        staged: [],
        unstaged: [],
        untracked: [],
      },
      summaries: [],
      totalFiles: 0,
    };
  }

  async getFileDiff(file: string, scope?: string): Promise<FileDiffResponse> {
    return {
      scope: scope ?? 'root',
      file,
      diff: '',
      additions: 0,
      deletions: 0,
    };
  }

  async summarizeChanges(request: SummarizeRequest): Promise<SummarizeResponse> {
    return {
      scope: request.scope,
      file: request.file,
      summary: 'Mock summary: No changes detected.',
      tokensUsed: 0,
    };
  }

  async generatePlan(request: GenerateRequest): Promise<GenerateResponse> {
    return {
      success: true,
      secretsDetected: false,
      plan: {
        schemaVersion: '1.0',
        createdAt: new Date().toISOString(),
        repoRoot: '/mock/path',
        gitStatus: {
          staged: [],
          unstaged: [],
          untracked: [],
        },
        commits: [],
        metadata: {
          totalFiles: 0,
          totalCommits: 0,
          llmUsed: false,
        },
      },
      planPath: '.kb/commit/current/plan.json',
      scope: request.scope,
    };
  }

  async patchPlan(request: PatchPlanRequest): Promise<PatchPlanResponse> {
    return {
      success: true,
      scope: request.scope ?? 'root',
      commitId: request.commitId,
    };
  }

  async regenerateCommit(request: RegenerateCommitRequest): Promise<RegenerateCommitResponse> {
    return {
      success: true,
      scope: request.scope ?? 'root',
      commitId: request.commitId,
    };
  }

  async applyCommits(request: ApplyRequest): Promise<ApplyResponse> {
    return {
      scope: request.scope,
      result: {
        success: true,
        errors: [],
        appliedCommits: [],
      },
    };
  }

  async pushCommits(request: PushRequest): Promise<PushResponse> {
    return {
      scope: request.scope,
      result: {
        success: true,
        remote: request.remote || 'origin',
        branch: 'main',
        commitsPushed: 0,
      },
    };
  }

  async resetPlan(scope?: string): Promise<ResetResponse> {
    return {
      success: true,
      message: 'Plan deleted successfully',
      scope: scope ?? 'root',
    };
  }
}
