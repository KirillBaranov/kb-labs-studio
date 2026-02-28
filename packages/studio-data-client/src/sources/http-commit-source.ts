/**
 * @module @kb-labs/studio-data-client/sources/http-commit-source
 * HTTP implementation of CommitDataSource
 */

import type { HttpClient } from '../client/http-client';
import type { CommitDataSource } from './commit-source';
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
 * HTTP implementation of CommitDataSource
 */
export class HttpCommitSource implements CommitDataSource {
  private readonly basePath = '/plugins/commit';

  constructor(private client: HttpClient) {}

  async getScopes(): Promise<ScopesResponse> {
    // Backend returns SelectData with folder-based scope IDs
    const selectData = await this.client.fetch<{
      value: string;
      options: Array<{ value: string; label: string; description?: string }>;
    }>(`${this.basePath}/scopes`);

    return {
      scopes: selectData.options.map(opt => ({
        id: opt.value,
        name: opt.label,
        path: opt.value,
        description: opt.description,
      })),
    };
  }

  async getStatus(scope?: string): Promise<StatusResponse> {
    const params = new URLSearchParams();
    if (scope) {params.set('scope', scope);}
    const query = params.toString();
    return this.client.fetch<StatusResponse>(`${this.basePath}/status${query ? `?${query}` : ''}`);
  }

  async getPlan(scope?: string): Promise<PlanResponse> {
    const params = new URLSearchParams();
    if (scope) {params.set('scope', scope);}
    const query = params.toString();
    return this.client.fetch<PlanResponse>(`${this.basePath}/plan${query ? `?${query}` : ''}`);
  }

  async getGitStatus(scope?: string): Promise<GitStatusResponse> {
    const params = new URLSearchParams();
    if (scope) {params.set('scope', scope);}
    const query = params.toString();
    return this.client.fetch<GitStatusResponse>(`${this.basePath}/git-status${query ? `?${query}` : ''}`);
  }

  async getFileDiff(file: string, scope?: string): Promise<FileDiffResponse> {
    const params = new URLSearchParams({ file });
    if (scope) {params.set('scope', scope);}
    return this.client.fetch<FileDiffResponse>(`${this.basePath}/diff?${params}`);
  }

  async summarizeChanges(request: SummarizeRequest): Promise<SummarizeResponse> {
    return this.client.fetch<SummarizeResponse>(`${this.basePath}/summarize`, {
      method: 'POST',
      data: request,
    });
  }

  async generatePlan(request: GenerateRequest): Promise<GenerateResponse> {
    return this.client.fetch<GenerateResponse>(`${this.basePath}/generate`, {
      method: 'POST',
      data: request,
    });
  }

  async patchPlan(request: PatchPlanRequest): Promise<PatchPlanResponse> {
    return this.client.fetch<PatchPlanResponse>(`${this.basePath}/plan`, {
      method: 'PATCH',
      data: request,
    });
  }

  async regenerateCommit(request: RegenerateCommitRequest): Promise<RegenerateCommitResponse> {
    return this.client.fetch<RegenerateCommitResponse>(`${this.basePath}/regenerate-commit`, {
      method: 'POST',
      data: request,
    });
  }

  async applyCommits(request: ApplyRequest): Promise<ApplyResponse> {
    return this.client.fetch<ApplyResponse>(`${this.basePath}/apply`, {
      method: 'POST',
      data: request,
    });
  }

  async pushCommits(request: PushRequest): Promise<PushResponse> {
    return this.client.fetch<PushResponse>(`${this.basePath}/push`, {
      method: 'POST',
      data: request,
    });
  }

  async resetPlan(scope?: string): Promise<ResetResponse> {
    const params = new URLSearchParams();
    if (scope) {params.set('scope', scope);}
    const query = params.toString();
    return this.client.fetch<ResetResponse>(`${this.basePath}/plan${query ? `?${query}` : ''}`, {
      method: 'DELETE',
    });
  }
}
