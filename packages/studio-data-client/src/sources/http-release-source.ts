/**
 * @module @kb-labs/studio-data-client/sources/http-release-source
 * HTTP implementation of ReleaseDataSource
 */

import { HttpClient } from '../client/http-client';
import type { ReleaseDataSource } from './release-source';
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
 * HTTP implementation of ReleaseDataSource
 */
export class HttpReleaseSource implements ReleaseDataSource {
  private readonly basePath = '/plugins/release';

  constructor(private client: HttpClient) {}

  // === Scopes ===
  async getScopes(): Promise<ScopesResponse> {
    return await this.client.fetch<ScopesResponse>(`${this.basePath}/scopes`);
  }

  // === Status ===
  async getStatus(scope: string): Promise<StatusResponse> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<StatusResponse>(`${this.basePath}/status?${params}`);
  }

  // === Plan ===
  async getPlan(scope: string): Promise<PlanResponse> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<PlanResponse>(`${this.basePath}/plan?${params}`);
  }

  async generatePlan(request: GeneratePlanRequest): Promise<GeneratePlanResponse> {
    return await this.client.fetch<GeneratePlanResponse>(`${this.basePath}/generate`, {
      method: 'POST',
      data: request,
    });
  }

  async resetPlan(scope: string): Promise<{ success: boolean }> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<{ success: boolean }>(
      `${this.basePath}/plan?${params}`,
      {
        method: 'DELETE',
      }
    );
  }

  // === Preview ===
  async getPreview(scope: string): Promise<PreviewResponse> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<PreviewResponse>(`${this.basePath}/preview?${params}`);
  }

  // === Verify ===
  async getVerify(scope: string): Promise<VerifyResponse> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<VerifyResponse>(`${this.basePath}/verify?${params}`);
  }

  // === Changelog ===
  async getChangelog(
    scope: string,
    options?: { from?: string; to?: string }
  ): Promise<ChangelogResponse> {
    const params = new URLSearchParams({ scope });
    if (options?.from) params.set('from', options.from);
    if (options?.to) params.set('to', options.to);
    return await this.client.fetch<ChangelogResponse>(`${this.basePath}/changelog?${params}`);
  }

  async generateChangelog(
    request: GenerateChangelogRequest
  ): Promise<GenerateChangelogResponse> {
    return await this.client.fetch<GenerateChangelogResponse>(
      `${this.basePath}/changelog/generate`,
      {
        method: 'POST',
        data: request,
      }
    );
  }

  async saveChangelog(request: SaveChangelogRequest): Promise<SaveChangelogResponse> {
    return await this.client.fetch<SaveChangelogResponse>(`${this.basePath}/changelog/save`, {
      method: 'POST',
      data: request,
    });
  }

  // === Release ===
  async runRelease(request: RunReleaseRequest): Promise<RunReleaseResponse> {
    return await this.client.fetch<RunReleaseResponse>(`${this.basePath}/run`, {
      method: 'POST',
      data: request,
    });
  }

  async publish(request: PublishRequest): Promise<PublishResponse> {
    return await this.client.fetch<PublishResponse>(`${this.basePath}/publish`, {
      method: 'POST',
      data: request,
    });
  }

  async rollback(request: RollbackRequest): Promise<RollbackResponse> {
    return await this.client.fetch<RollbackResponse>(`${this.basePath}/rollback`, {
      method: 'POST',
      data: request,
    });
  }

  // === Report ===
  async getReport(): Promise<ReportResponse> {
    return await this.client.fetch<ReportResponse>(`${this.basePath}/report`);
  }

  // === History ===
  async getHistory(): Promise<HistoryResponse> {
    return await this.client.fetch<HistoryResponse>(`${this.basePath}/history`);
  }

  async getHistoryReport(scope: string, id: string): Promise<HistoryReportResponse> {
    return await this.client.fetch<HistoryReportResponse>(
      `${this.basePath}/history/${scope}/${id}/report`
    );
  }

  async getHistoryPlan(scope: string, id: string): Promise<HistoryPlanResponse> {
    return await this.client.fetch<HistoryPlanResponse>(
      `${this.basePath}/history/${scope}/${id}/plan`
    );
  }

  async getHistoryChangelog(scope: string, id: string): Promise<HistoryChangelogResponse> {
    return await this.client.fetch<HistoryChangelogResponse>(
      `${this.basePath}/history/${scope}/${id}/changelog`
    );
  }

  // === Git Timeline ===
  async getGitTimeline(scope: string): Promise<GitTimelineResponse> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<GitTimelineResponse>(`${this.basePath}/git-timeline?${params}`);
  }

  // === Build ===
  async triggerBuild(request: BuildRequest): Promise<BuildResponse> {
    return await this.client.fetch<BuildResponse>(`${this.basePath}/build`, {
      method: 'POST',
      data: request,
    });
  }

  // === Checklist ===
  async getChecklist(scope: string): Promise<ReleaseChecklist> {
    const params = new URLSearchParams({ scope });
    return await this.client.fetch<ReleaseChecklist>(`${this.basePath}/checklist?${params}`);
  }
}

