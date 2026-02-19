/**
 * @module @kb-labs/studio-data-client/sources/commit-source
 * Commit plugin data source
 *
 * TODO: TEMPORARY - Remove after commit plugin UI is polished and re-enabled in manifest
 * This is a temporary solution to provide custom commit page while widget UI is being improved
 */

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
  // @ts-ignore - commit-contracts doesn't generate .d.ts files yet
} from '@kb-labs/commit-contracts';

/**
 * Commit data source interface
 */
export interface CommitDataSource {
  /**
   * GET /scopes - List available scopes
   */
  getScopes(): Promise<ScopesResponse>;

  /**
   * GET /status?scope=X - Get current status (plan + git)
   */
  getStatus(scope?: string): Promise<StatusResponse>;

  /**
   * GET /plan?scope=X - Get current commit plan
   */
  getPlan(scope?: string): Promise<PlanResponse>;

  /**
   * GET /git-status?scope=X - Get git status with file details
   */
  getGitStatus(scope?: string): Promise<GitStatusResponse>;

  /**
   * GET /diff?scope=X&file=Y - Get diff for a specific file
   */
  getFileDiff(file: string, scope?: string): Promise<FileDiffResponse>;

  /**
   * POST /summarize - Summarize changes using LLM
   */
  summarizeChanges(request: SummarizeRequest): Promise<SummarizeResponse>;

  /**
   * POST /generate - Generate new commit plan
   */
  generatePlan(request: GenerateRequest): Promise<GenerateResponse>;

  /**
   * PATCH /plan - Edit a single commit in the plan
   */
  patchPlan(request: PatchPlanRequest): Promise<PatchPlanResponse>;

  /**
   * POST /regenerate-commit - Regenerate a single commit with LLM
   */
  regenerateCommit(request: RegenerateCommitRequest): Promise<RegenerateCommitResponse>;

  /**
   * POST /apply - Apply commit plan (supports selective apply via commitIds)
   */
  applyCommits(request: ApplyRequest): Promise<ApplyResponse>;

  /**
   * POST /push - Push commits to remote
   */
  pushCommits(request: PushRequest): Promise<PushResponse>;

  /**
   * DELETE /plan?scope=X - Delete current plan
   */
  resetPlan(scope?: string): Promise<ResetResponse>;
}
