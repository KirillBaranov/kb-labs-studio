/**
 * @module @kb-labs/studio-data-client/sources/qa-source
 * QA data source interface for Studio
 */

import type {
  HistoryEntry,
  TrendResult,
  EnrichedTrendResult,
  RegressionResult,
  BaselineSnapshot,
  SubmoduleInfo,
  PackageCheckDetail,
} from '@kb-labs/qa-contracts';

/**
 * Aggregated QA summary for dashboard overview.
 */
export interface QASummaryResponse {
  status: string;
  lastRunAt: string | null;
  git: { commit: string; branch: string; message: string } | null;
  checks: Array<{
    checkType: string;
    label: string;
    passed: number;
    failed: number;
    skipped: number;
    total: number;
  }>;
  hasBaseline: boolean;
  baselineTimestamp: string | null;
  historyCount: number;
}

export interface QAHistoryResponse {
  entries: HistoryEntry[];
  total: number;
}

export interface QATrendsResponse {
  trends: TrendResult[];
  historyCount: number;
  window: number;
}

export interface QAEnrichedTrendsResponse {
  trends: EnrichedTrendResult[];
  historyCount: number;
  window: number;
}

export interface QABaselineResponse {
  baseline: BaselineSnapshot | null;
}

/**
 * Options for running QA checks from Studio.
 */
export interface QARunOptions {
  skipBuild?: boolean;
  skipLint?: boolean;
  skipTypes?: boolean;
  skipTests?: boolean;
  saveToHistory?: boolean;
}

/**
 * Response from a QA run.
 */
export interface QARunResultResponse {
  status: 'passed' | 'failed';
  results: Record<string, { passed: string[]; failed: string[]; skipped: string[]; errors: Record<string, string> }>;
  entry: HistoryEntry | null;
  durationMs: number;
}

/**
 * Per-package details from the last QA run.
 */
export interface QADetailsResponse {
  timestamp: string | null;
  git: { commit: string; branch: string; message: string } | null;
  submodules?: Record<string, SubmoduleInfo>;
  checks: Record<string, {
    passed: PackageCheckDetail[];
    failed: PackageCheckDetail[];
    skipped: PackageCheckDetail[];
  }>;
}

/**
 * Options for running a single check type.
 */
export interface QARunCheckOptions {
  checkType: 'lint' | 'typeCheck' | 'test';
  repo?: string;
  package?: string;
}

/**
 * Response from running a single check.
 */
export interface QARunCheckResponse {
  checkType: string;
  status: 'passed' | 'failed';
  result: { passed: string[]; failed: string[]; skipped: string[]; errors: Record<string, string> };
  durationMs: number;
}

/**
 * Response from baseline update.
 */
export interface QABaselineUpdateResponse {
  success: boolean;
  baseline: BaselineSnapshot;
}

/**
 * Baseline diff — new failures, fixed, still failing.
 */
export interface QABaselineDiffResponse {
  hasDiff: boolean;
  diff: Record<string, { newFailures: string[]; fixed: string[]; stillFailing: string[]; delta: number }>;
  baseline: BaselineSnapshot | null;
  current: {
    timestamp: string;
    summary: Record<string, { passed: number; failed: number }>;
  } | null;
}

/**
 * Per-package QA timeline with flaky detection.
 */
export interface QAPackageTimelineResponse {
  packageName: string;
  repo: string;
  entries: Array<{
    timestamp: string;
    git: { commit: string; branch: string; message: string };
    submoduleCommit?: string;
    checks: Record<string, 'passed' | 'failed' | 'skipped'>;
  }>;
  flakyScore: number;
  flakyChecks: string[];
  firstFailure?: string;
  currentStreak: { status: 'passing' | 'failing'; count: number };
}

/**
 * Error groups — errors grouped by pattern.
 */
export interface QAErrorGroupsResponse {
  groups: Array<{
    pattern: string;
    count: number;
    packages: string[];
    checkType: string;
    example: string;
  }>;
  ungrouped: number;
}

/**
 * QA data source interface.
 * Provides access to QA check results, history, trends, and regressions.
 */
export interface QADataSource {
  getSummary(): Promise<QASummaryResponse>;
  getLatest(): Promise<{ entry: HistoryEntry | null }>;
  getHistory(limit?: number): Promise<QAHistoryResponse>;
  getTrends(window?: number): Promise<QATrendsResponse>;
  getEnrichedTrends(window?: number): Promise<QAEnrichedTrendsResponse>;
  getRegressions(): Promise<RegressionResult>;
  getBaseline(): Promise<QABaselineResponse>;
  runQA(options?: QARunOptions): Promise<QARunResultResponse>;

  // Control plane methods
  getDetails(): Promise<QADetailsResponse>;
  runCheck(options: QARunCheckOptions): Promise<QARunCheckResponse>;
  updateBaseline(): Promise<QABaselineUpdateResponse>;
  getBaselineDiff(): Promise<QABaselineDiffResponse>;
  getPackageTimeline(packageName: string): Promise<QAPackageTimelineResponse>;
  getErrorGroups(): Promise<QAErrorGroupsResponse>;
}
