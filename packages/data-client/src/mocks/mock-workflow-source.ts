import { ulid } from 'ulid';
import type {
  WorkflowDataSource,
  WorkflowRunsFilters,
  WorkflowRunParams,
} from '../sources/workflow-source';
import type { WorkflowRun } from '../contracts/workflows';

function createMockRun(overrides: Partial<WorkflowRun> = {}): WorkflowRun {
  const now = new Date().toISOString();
  return {
    id: ulid(),
    name: 'demo-workflow',
    version: '1.0.0',
    status: 'success',
    createdAt: now,
    queuedAt: now,
    startedAt: now,
    finishedAt: now,
    trigger: {
      type: 'manual',
      actor: 'mock-user',
      payload: {},
    },
    jobs: [],
    artifacts: [],
    metadata: {},
    ...overrides,
  };
}

export class MockWorkflowSource implements WorkflowDataSource {
  private runs: WorkflowRun[] = [createMockRun()];

  async listRuns(_filters?: WorkflowRunsFilters) {
    return {
      runs: this.runs,
      total: this.runs.length,
    };
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    return this.runs.find(run => run.id === runId) ?? null;
  }

  async cancelRun(runId: string): Promise<WorkflowRun> {
    const run = await this.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }
    const updated = {
      ...run,
      status: 'cancelled' as WorkflowRun['status'],
      finishedAt: new Date().toISOString(),
    };
    this.runs = this.runs.map(existing => (existing.id === runId ? updated : existing));
    return updated;
  }

  async runWorkflow(params: WorkflowRunParams): Promise<WorkflowRun> {
    const run = createMockRun({
      id: ulid(),
      name: params.spec.name,
      version: params.spec.version,
      status: 'queued',
      metadata: params.metadata ?? {},
    });
    this.runs = [run, ...this.runs];
    return run;
  }

  async listEvents() {
    return {
      events: [],
      cursor: null,
    };
  }
}


