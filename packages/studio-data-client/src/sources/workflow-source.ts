import type {
  WorkflowRun,
  WorkflowSpec,
  WorkflowRunsListResponse,
  WorkflowPresenterEvent,
} from '../contracts/workflows';

export interface WorkflowRunsFilters {
  status?: string;
  limit?: number;
}

export interface WorkflowRunParams {
  spec: WorkflowSpec;
  idempotencyKey?: string;
  concurrencyGroup?: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowDataSource {
  listRuns(filters?: WorkflowRunsFilters): Promise<WorkflowRunsListResponse>;
  getRun(runId: string): Promise<WorkflowRun | null>;
  cancelRun(runId: string): Promise<WorkflowRun>;
  runWorkflow?(params: WorkflowRunParams): Promise<WorkflowRun>;
  listEvents?(
    runId: string,
    options?: { cursor?: string | null; limit?: number },
  ): Promise<{ events: WorkflowPresenterEvent[]; cursor: string | null }>;
}
