/**
 * @module @kb-labs/studio-data-client/sources/release-source
 * Release Manager data source interface
 */

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
  PreviewResponse,
  BuildRequest,
  BuildResponse,
  ReleaseChecklist,
} from '@kb-labs/release-manager-contracts';

/**
 * Release Manager data source interface
 */
export interface ReleaseDataSource {
  // === Scopes ===
  getScopes(): Promise<ScopesResponse>;

  // === Status ===
  getStatus(scope: string): Promise<StatusResponse>;

  // === Plan ===
  getPlan(scope: string): Promise<PlanResponse>;
  generatePlan(request: GeneratePlanRequest): Promise<GeneratePlanResponse>;
  resetPlan(scope: string): Promise<{ success: boolean }>;

  // === Preview ===
  getPreview(scope: string): Promise<PreviewResponse>;

  // === Verify ===
  getVerify(scope: string): Promise<VerifyResponse>;

  // === Changelog ===
  getChangelog(scope: string, options?: { from?: string; to?: string }): Promise<ChangelogResponse>;
  generateChangelog(request: GenerateChangelogRequest): Promise<GenerateChangelogResponse>;
  saveChangelog(request: SaveChangelogRequest): Promise<SaveChangelogResponse>;

  // === Release ===
  runRelease(request: RunReleaseRequest): Promise<RunReleaseResponse>;
  publish(request: PublishRequest): Promise<PublishResponse>;
  rollback(request: RollbackRequest): Promise<RollbackResponse>;

  // === Report ===
  getReport(): Promise<ReportResponse>;

  // === History ===
  getHistory(): Promise<HistoryResponse>;
  getHistoryReport(scope: string, id: string): Promise<HistoryReportResponse>;
  getHistoryPlan(scope: string, id: string): Promise<HistoryPlanResponse>;
  getHistoryChangelog(scope: string, id: string): Promise<HistoryChangelogResponse>;

  // === Git Timeline ===
  getGitTimeline(scope: string): Promise<GitTimelineResponse>;

  // === Build ===
  triggerBuild(request: BuildRequest): Promise<BuildResponse>;

  // === Checklist ===
  getChecklist(scope: string): Promise<ReleaseChecklist>;
}

