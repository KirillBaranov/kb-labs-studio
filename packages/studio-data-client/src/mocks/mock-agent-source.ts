/**
 * @module @kb-labs/studio-data-client/mocks/mock-agent-source
 * Mock implementation of AgentDataSource for development
 */

import type { AgentDataSource } from '../sources/agent-source';
import type {
  ListAgentsResponse,
  RunRequest,
  RunResponse,
  RunStatusResponse,
  CorrectionRequest,
  CorrectionResponse,
  StopResponse,
  ListSessionsRequest,
  ListSessionsResponse,
  GetSessionResponse,
  GetSessionEventsResponse,
  CreateSessionRequest,
  CreateSessionResponse,
  AgentSessionInfo,
  AgentEvent,
} from '@kb-labs/agent-contracts';

// Mock run state for simulating async execution
interface MockRunState {
  runId: string;
  sessionId: string;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  summary?: string;
}

const mockRuns = new Map<string, MockRunState>();
const mockSessions = new Map<string, AgentSessionInfo>();
const mockEvents = new Map<string, AgentEvent[]>();

/**
 * Mock agent data source for development without backend
 */
export class MockAgentSource implements AgentDataSource {
  private runCounter = 0;
  private sessionCounter = 0;

  async listAgents(): Promise<ListAgentsResponse> {
    await this.delay(200);

    return {
      agents: [
        {
          id: 'mind-assistant',
          name: 'Mind Assistant',
          description: 'Intelligent code assistant powered by Mind RAG for semantic search and code understanding',
          tools: ['mind:rag-query', 'mind:rag-status', 'fs:read', 'fs:search'],
          tier: 'medium',
        },
        {
          id: 'coding-assistant',
          name: 'Coding Assistant',
          description: 'A helpful agent that assists with coding tasks, file operations, and running commands',
          tools: ['fs:read', 'fs:write', 'fs:search', 'shell:exec', 'kb-labs:*'],
          tier: 'large',
        },
        {
          id: 'code-reviewer',
          name: 'Code Reviewer',
          description: 'Performs code review, identifies bugs, suggests improvements, and checks code quality',
          tools: ['fs:read', 'fs:search', 'shell:exec'],
          tier: 'medium',
        },
      ],
      total: 3,
    };
  }

  async startRun(request: RunRequest): Promise<RunResponse> {
    await this.delay(100);

    const runId = `mock-run-${++this.runCounter}-${Date.now()}`;
    const startedAt = new Date().toISOString();

    // Get or create session
    let sessionId = request.sessionId;
    if (!sessionId) {
      const session = await this.createSession({
        agentId: request.agentId ?? 'orchestrator',
        task: request.task,
      });
      sessionId = session.session.id;
    }

    // Create mock run state
    const runState: MockRunState = {
      runId,
      sessionId,
      task: request.task,
      status: 'running',
      startedAt,
    };
    mockRuns.set(runId, runState);

    // Simulate run completion after delay
    setTimeout(() => {
      const run = mockRuns.get(runId);
      if (run && run.status === 'running') {
        run.status = 'completed';
        run.completedAt = new Date().toISOString();
        run.durationMs = 5000;
        run.summary = `Successfully completed task: "${request.task}"`;
      }
    }, 5000);

    return {
      runId,
      sessionId,
      eventsUrl: `ws://localhost:5050/ws/agents/events/${runId}`,
      status: 'started',
      startedAt,
    };
  }

  async getStatus(runId: string): Promise<RunStatusResponse> {
    await this.delay(100);

    const run = mockRuns.get(runId);
    if (!run) {
      return {
        runId,
        status: 'failed',
        task: 'Unknown',
        startedAt: new Date().toISOString(),
        error: `Run ${runId} not found`,
      };
    }

    return {
      runId: run.runId,
      status: run.status,
      task: run.task,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      durationMs: run.durationMs,
      summary: run.summary,
      activeAgents: run.status === 'running' ? [
        { id: 'orchestrator', task: run.task, status: 'running' as const },
      ] : undefined,
    };
  }

  async sendCorrection(runId: string, request: CorrectionRequest): Promise<CorrectionResponse> {
    await this.delay(200);

    const run = mockRuns.get(runId);
    if (!run || run.status !== 'running') {
      return {
        correctionId: '',
        routedTo: [],
        reason: run ? `Run is not running (status: ${run.status})` : 'Run not found',
        applied: false,
      };
    }

    return {
      correctionId: `corr-${Date.now()}`,
      routedTo: request.targetAgentId ? [request.targetAgentId] : ['orchestrator'],
      reason: `Correction routed to ${request.targetAgentId || 'orchestrator'} based on message content`,
      applied: true,
    };
  }

  async stopRun(runId: string, reason?: string): Promise<StopResponse> {
    await this.delay(100);

    const run = mockRuns.get(runId);
    if (!run) {
      return {
        stopped: false,
        runId,
        finalStatus: 'not_found',
      };
    }

    if (run.status !== 'running') {
      return {
        stopped: false,
        runId,
        finalStatus: 'already_completed',
      };
    }

    run.status = 'stopped';
    run.completedAt = new Date().toISOString();
    run.durationMs = Date.now() - new Date(run.startedAt).getTime();
    run.summary = reason || 'Stopped by user';

    return {
      stopped: true,
      runId,
      finalStatus: 'stopped',
    };
  }

  getEventsUrl(runId: string): string {
    return `ws://localhost:5050/ws/agents/events/${runId}`;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Session Management (Mock)
  // ═══════════════════════════════════════════════════════════════════════

  async listSessions(request?: ListSessionsRequest): Promise<ListSessionsResponse> {
    await this.delay(100);

    let sessions = Array.from(mockSessions.values());

    // Apply filters
    if (request?.agentId) {
      sessions = sessions.filter((s) => s.agentId === request.agentId);
    }
    if (request?.status) {
      sessions = sessions.filter((s) => s.status === request.status);
    }

    // Sort by last activity
    sessions.sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

    // Apply pagination
    const offset = request?.offset ?? 0;
    const limit = request?.limit ?? 50;
    const total = sessions.length;
    sessions = sessions.slice(offset, offset + limit);

    return { sessions, total };
  }

  async getSession(sessionId: string): Promise<GetSessionResponse> {
    await this.delay(100);

    const session = mockSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    return { session };
  }

  async getSessionEvents(
    sessionId: string,
    limit?: number,
    offset?: number
  ): Promise<GetSessionEventsResponse> {
    await this.delay(100);

    let events = mockEvents.get(sessionId) ?? [];
    const total = events.length;

    if (offset) {events = events.slice(offset);}
    if (limit) {events = events.slice(0, limit);}

    return { events, total };
  }

  async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
    await this.delay(100);

    const sessionId = `mock-session-${++this.sessionCounter}-${Date.now()}`;
    const now = new Date().toISOString();

    const session: AgentSessionInfo = {
      id: sessionId,
      agentId: request.agentId,
      name: request.name || (request.task ? request.task.slice(0, 50) + '...' : 'New Session'),
      mode: 'execute',
      task: request.task ?? '',
      workingDir: '/mock/working/dir',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      runCount: 0,
      lastActivityAt: now,
    };

    mockSessions.set(sessionId, session);
    mockEvents.set(sessionId, []);

    return { session };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
