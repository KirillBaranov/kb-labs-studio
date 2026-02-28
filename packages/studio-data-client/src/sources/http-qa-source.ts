/**
 * @module @kb-labs/studio-data-client/sources/http-qa-source
 * HTTP implementation of QADataSource
 */

import type { HttpClient } from '../client/http-client.js';
import type {
  QADataSource,
  QASummaryResponse,
  QAHistoryResponse,
  QATrendsResponse,
  QAEnrichedTrendsResponse,
  QABaselineResponse,
  QARunOptions,
  QARunResultResponse,
  QADetailsResponse,
  QARunCheckOptions,
  QARunCheckResponse,
  QABaselineUpdateResponse,
  QABaselineDiffResponse,
  QAPackageTimelineResponse,
  QAErrorGroupsResponse,
} from './qa-source.js';
import type { HistoryEntry, RegressionResult } from '@kb-labs/qa-contracts';
import { QA_ROUTES } from '@kb-labs/qa-contracts';

export class HttpQASource implements QADataSource {
  // basePath without /api/v1 prefix — HTTP client adds it automatically
  private readonly basePath = '/plugins/qa';

  constructor(private client: HttpClient) {}

  async getSummary(): Promise<QASummaryResponse> {
    return this.client.fetch<QASummaryResponse>(
      `${this.basePath}${QA_ROUTES.SUMMARY}`,
    );
  }

  async getLatest(): Promise<{ entry: HistoryEntry | null }> {
    return this.client.fetch<{ entry: HistoryEntry | null }>(
      `${this.basePath}${QA_ROUTES.LATEST}`,
    );
  }

  async getHistory(limit?: number): Promise<QAHistoryResponse> {
    const params = new URLSearchParams();
    if (limit !== undefined && limit > 0) {
      params.set('limit', String(limit));
    }
    const query = params.toString();
    return this.client.fetch<QAHistoryResponse>(
      `${this.basePath}${QA_ROUTES.HISTORY}${query ? `?${query}` : ''}`,
    );
  }

  async getTrends(window?: number): Promise<QATrendsResponse> {
    const params = new URLSearchParams();
    if (window !== undefined && window > 0) {
      params.set('window', String(window));
    }
    const query = params.toString();
    return this.client.fetch<QATrendsResponse>(
      `${this.basePath}${QA_ROUTES.TRENDS}${query ? `?${query}` : ''}`,
    );
  }

  async getEnrichedTrends(window?: number): Promise<QAEnrichedTrendsResponse> {
    const params = new URLSearchParams();
    params.set('enriched', 'true');
    if (window !== undefined && window > 0) {
      params.set('window', String(window));
    }
    return this.client.fetch<QAEnrichedTrendsResponse>(
      `${this.basePath}${QA_ROUTES.TRENDS}?${params.toString()}`,
    );
  }

  async getRegressions(): Promise<RegressionResult> {
    return this.client.fetch<RegressionResult>(
      `${this.basePath}${QA_ROUTES.REGRESSIONS}`,
    );
  }

  async getBaseline(): Promise<QABaselineResponse> {
    return this.client.fetch<QABaselineResponse>(
      `${this.basePath}${QA_ROUTES.BASELINE}`,
    );
  }

  async runQA(options?: QARunOptions): Promise<QARunResultResponse> {
    return this.client.fetch<QARunResultResponse>(
      `${this.basePath}${QA_ROUTES.RUN}`,
      {
        method: 'POST',
        data: options ?? {},
      },
    );
  }

  async getDetails(): Promise<QADetailsResponse> {
    return this.client.fetch<QADetailsResponse>(
      `${this.basePath}${QA_ROUTES.DETAILS}`,
    );
  }

  async runCheck(options: QARunCheckOptions): Promise<QARunCheckResponse> {
    return this.client.fetch<QARunCheckResponse>(
      `${this.basePath}${QA_ROUTES.RUN_CHECK}`,
      {
        method: 'POST',
        data: options,
      },
    );
  }

  async updateBaseline(): Promise<QABaselineUpdateResponse> {
    return this.client.fetch<QABaselineUpdateResponse>(
      `${this.basePath}${QA_ROUTES.BASELINE_UPDATE}`,
      {
        method: 'POST',
        data: {},
      },
    );
  }

  async getBaselineDiff(): Promise<QABaselineDiffResponse> {
    return this.client.fetch<QABaselineDiffResponse>(
      `${this.basePath}${QA_ROUTES.BASELINE_DIFF}`,
    );
  }

  async getPackageTimeline(packageName: string): Promise<QAPackageTimelineResponse> {
    const path = QA_ROUTES.PACKAGE_TIMELINE.replace(':name', encodeURIComponent(packageName));
    return this.client.fetch<QAPackageTimelineResponse>(
      `${this.basePath}${path}`,
    );
  }

  async getErrorGroups(): Promise<QAErrorGroupsResponse> {
    return this.client.fetch<QAErrorGroupsResponse>(
      `${this.basePath}${QA_ROUTES.ERROR_GROUPS}`,
    );
  }
}
