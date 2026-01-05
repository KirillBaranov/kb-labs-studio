import type { HttpClient } from '../client/http-client'
import { KBError } from '../errors/kb-error'
import type {
  WorkflowDataSource,
  WorkflowRunsFilters,
  WorkflowRunParams,
} from './workflow-source'
import type {
  WorkflowRun,
  WorkflowRunsListResponse,
  WorkflowPresenterEvent,
} from '../contracts/workflows'

function buildQuery(params?: WorkflowRunsFilters): string {
  if (!params || Object.keys(params).length === 0) {
    return ''
  }
  const query = new URLSearchParams()
  if (params.status) {
    query.set('status', params.status)
  }
  if (typeof params.limit === 'number' && !Number.isNaN(params.limit)) {
    query.set('limit', String(params.limit))
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

// No longer needed with axios (handles JSON automatically)

export class HttpWorkflowSource implements WorkflowDataSource {
  constructor(private readonly client: HttpClient) {}

  async listRuns(filters?: WorkflowRunsFilters): Promise<WorkflowRunsListResponse> {
    const query = buildQuery(filters)
    return await this.client.fetch<WorkflowRunsListResponse>(`/workflows/runs${query}`)
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    try {
      const response = await this.client.fetch<{ run: WorkflowRun }>(`/workflows/runs/${runId}`)
      return response.run
    } catch (error) {
      if (error instanceof KBError && error.status === 404) {
        return null
      }
      throw error
    }
  }

  async cancelRun(runId: string): Promise<WorkflowRun> {
    const response = await this.client.fetch<{ run: WorkflowRun }>(
      `/workflows/runs/${runId}/cancel`,
      {
        method: 'POST',
      },
    )
    return response.run
  }

  async runWorkflow(params: WorkflowRunParams): Promise<WorkflowRun> {
    const response = await this.client.fetch<{ run: WorkflowRun }>(`/workflows/run`, {
      method: 'POST',
      data: {
        inlineSpec: params.spec,
        idempotency: params.idempotencyKey,
        concurrency: params.concurrencyGroup ? { group: params.concurrencyGroup } : undefined,
        metadata: params.metadata,
      },
    })
    return response.run
  }

  async listEvents(
    runId: string,
    options: { cursor?: string | null; limit?: number } = {},
  ): Promise<{ events: WorkflowPresenterEvent[]; cursor: string | null }> {
    const params = new URLSearchParams()
    if (options.cursor) {
      params.set('cursor', options.cursor)
    }
    if (typeof options.limit === 'number' && !Number.isNaN(options.limit)) {
      params.set('limit', String(options.limit))
    }
    const query = params.toString()
    return await this.client.fetch<{ events: WorkflowPresenterEvent[]; cursor: string | null }>(
      `/workflows/runs/${runId}/events${query ? `?${query}` : ''}`,
    )
  }
}
