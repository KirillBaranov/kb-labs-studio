/**
 * @module studio/agents/conversation-view
 * Turn-based conversation UI — Claude Code style
 */

import React from 'react';
import { Spin, Modal, message } from 'antd';
import type { Turn, TurnStep, FileChangeSummary } from '@kb-labs/agent-contracts';
import { MarkdownViewer } from '@/components/markdown';
import type { AgentDataSource } from '@kb-labs/studio-data-client';
import { useFileChangeDiff, useRollbackChanges, useApproveChanges } from '@kb-labs/studio-data-client';
import './conversation-view.css';

interface ConversationViewProps {
  turns: Turn[];
  isLoading?: boolean;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  sessionId?: string | null;
  source?: AgentDataSource;
}

export function ConversationView({ turns, isLoading, scrollContainerRef: _scrollContainerRef, sessionId, source }: ConversationViewProps) {

  if (isLoading) {
    return (
      <div className="cv-empty">
        <Spin size="small" /> <span style={{ marginLeft: 8, color: '#999', fontSize: 13 }}>Loading history...</span>
      </div>
    );
  }

  if (turns.length === 0) {
    return (
      <div className="cv-empty">
        <span className="cv-empty-text">Ask anything to get started</span>
      </div>
    );
  }

  return (
    <div className="cv">
      {turns.map((turn) => (
        <TurnView key={turn.id} turn={turn} sessionId={sessionId} source={source} />
      ))}
    </div>
  );
}

function TurnView({ turn, sessionId, source }: { turn: Turn; sessionId?: string | null; source?: AgentDataSource }) {
  if (turn.type === 'user') {
    const text = turn.steps.find((s) => s.type === 'text');
    return (
      <div className="cv-user">
        <span className="cv-user-bubble">{text?.type === 'text' ? text.content : ''}</span>
      </div>
    );
  }

  // assistant turn
  const isStreaming = turn.status === 'streaming';
  const textSteps = turn.steps.filter((s) => s.type === 'text');
  const visibleTextSteps = textSteps.filter(
    (s) => !isInternalProgressText(s.content ?? '') && s.content?.trim(),
  );
  const hasInternalProgressText = textSteps.some((s) => isInternalProgressText(s.content ?? ''));

  // report tool_use carries the final answer in input.answer
  const reportStep = turn.steps.find(
    (s) => s.type === 'tool_use' && (s as import('@kb-labs/agent-contracts').ToolUseStep).toolName === 'report'
  ) as import('@kb-labs/agent-contracts').ToolUseStep | undefined;
  const reportAnswer = (reportStep?.input as Record<string, unknown> | null)?.answer as string | undefined;

  // Backend now merges tool_use + result in-place — filter out text steps and report tool
  const visibleSteps = turn.steps.filter(
    (s) => s.type !== 'text' && !(s.type === 'tool_use' && (s as import('@kb-labs/agent-contracts').ToolUseStep).toolName === 'report')
  );
  const hasToolSteps = visibleSteps.length > 0 || isStreaming || hasInternalProgressText;

  // Final answer: prefer report.input.answer, fallback to text steps
  const answerContent = reportAnswer || null;

  // File changes — only show for completed turns with changes
  const fileChanges = turn.metadata?.fileChanges;
  const runId = turn.metadata?.runId;
  const showFileChanges = !isStreaming && fileChanges && fileChanges.length > 0 && !!sessionId && !!source && !!runId;

  return (
    <div className="cv-assistant">
      {/* Tool/thinking steps with timeline */}
      {hasToolSteps && (
        <div className="cv-timeline">
          {visibleSteps.map((step, i) => (
            <StepRow key={step.id} step={step} isLast={false} isStreaming={isStreaming && i === visibleSteps.length - 1 && !answerContent && visibleTextSteps.length === 0} />
          ))}
          {isStreaming && (turn.steps.length === 0 || hasInternalProgressText) && (
            <div className="cv-step cv-step--thinking">
              <div className="cv-step-dot cv-step-dot--pulse" />
              <span className="cv-step-label">Агент анализирует и выполняет шаги...</span>
            </div>
          )}
        </div>
      )}
      {/* Final answer from report tool */}
      {answerContent && (
        <div className="cv-timeline cv-timeline--answer">
          <div className="cv-step cv-answer-block">
            <div className="cv-step-dot cv-step-dot--answer" />
            <MarkdownViewer className="cv-answer">{answerContent}</MarkdownViewer>
          </div>
        </div>
      )}
      {/* Fallback: text steps (for agents that don't use report tool) */}
      {!answerContent && visibleTextSteps.map((step) => (
        step.type === 'text' && step.content?.trim() ? (
          <div key={step.id} className="cv-timeline cv-timeline--answer">
            <div className="cv-step cv-answer-block">
              <div className="cv-step-dot cv-step-dot--answer" />
              <MarkdownViewer className="cv-answer">{step.content}</MarkdownViewer>
            </div>
          </div>
        ) : null
      ))}
      {/* File changes — inline timeline row */}
      {showFileChanges && (
        <div className="cv-timeline">
          <FileChangesBlock
            sessionId={sessionId!}
            runId={runId!}
            fileChanges={fileChanges!}
            source={source!}
          />
        </div>
      )}
    </div>
  );
}

// ─── File Changes Block ───────────────────────────────────────────────────────

interface FileChangesBlockProps {
  sessionId: string;
  runId: string;
  fileChanges: FileChangeSummary[];
  source: AgentDataSource;
}

function FileChangesBlock({ sessionId, runId, fileChanges, source }: FileChangesBlockProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const rollback = useRollbackChanges(source);
  const approve = useApproveChanges(source);

  const visible = fileChanges.filter((c) => !dismissed.has(c.changeId) && !c.approved);
  if (visible.length === 0) return null;

  const allApproved = visible.every((c) => c.approved);

  const handleRollback = () => {
    Modal.confirm({
      title: 'Откатить изменения?',
      content: `Это вернёт ${visible.length} ${pluralFiles(visible.length)} к состоянию до запуска агента.`,
      okText: 'Откатить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          const result = await rollback.mutateAsync({ sessionId, request: { runId } });
          if (result.conflicts?.length) {
            message.warning(`Откатано: ${result.rolledBack}, пропущено из-за конфликтов: ${result.skipped}`);
          } else {
            message.success(`Откатано ${result.rolledBack} ${pluralFiles(result.rolledBack)}`);
          }
          // Dismiss all from view
          setDismissed(new Set(visible.map((c) => c.changeId)));
        } catch {
          message.error('Не удалось откатить изменения');
        }
      },
    });
  };

  const handleApprove = async () => {
    try {
      await approve.mutateAsync({ sessionId, request: { runId } });
      message.success(`Одобрено ${visible.length} ${pluralFiles(visible.length)}`);
      setDismissed(new Set(visible.map((c) => c.changeId)));
    } catch {
      message.error('Не удалось одобрить изменения');
    }
  };

  return (
    <div className="cv-step cv-changes-block">
      <div className="cv-step-dot cv-step-dot--changes" />
      <div className="cv-step-body cv-changes-body">
        {/* Header */}
        <div className="cv-changes-header">
          <span className="cv-changes-title">{visible.length} {pluralFiles(visible.length)} изменено</span>
          {!allApproved && (
            <div className="cv-changes-actions">
              <button
                className="cv-changes-btn cv-changes-btn--approve"
                onClick={handleApprove}
                disabled={approve.isPending || rollback.isPending}
                title="Одобрить все изменения"
              >
                ✓
              </button>
              <button
                className="cv-changes-btn cv-changes-btn--rollback"
                onClick={handleRollback}
                disabled={rollback.isPending || approve.isPending}
                title="Откатить все изменения"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        {/* File list */}
        <ul className="cv-changes-list">
          {visible.map((change) => (
            <FileChangeRow
              key={change.changeId}
              change={change}
              sessionId={sessionId}
              source={source}
              onDismiss={() => setDismissed((prev) => new Set([...prev, change.changeId]))}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

interface FileChangeRowProps {
  change: FileChangeSummary;
  sessionId: string;
  source: AgentDataSource;
  onDismiss: () => void;
}

function FileChangeRow({ change, sessionId, source, onDismiss }: FileChangeRowProps) {
  const [open, setOpen] = React.useState(false);
  const rollback = useRollbackChanges(source);
  const approve = useApproveChanges(source);

  const diffQuery = useFileChangeDiff(source, sessionId, open ? change.changeId : null);

  const handleRollback = (e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: 'Откатить файл?',
      content: change.filePath,
      okText: 'Откатить',
      okButtonProps: { danger: true },
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await rollback.mutateAsync({ sessionId, request: { changeIds: [change.changeId] } });
          message.success('Файл откачен');
          onDismiss();
        } catch {
          message.error('Не удалось откатить');
        }
      },
    });
  };

  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await approve.mutateAsync({ sessionId, request: { changeIds: [change.changeId] } });
      message.success('Одобрено');
      onDismiss();
    } catch {
      message.error('Не удалось одобрить');
    }
  };

  const opBadge = change.operation === 'delete'
    ? { label: 'del', cls: 'cv-changes-op--delete' }
    : change.isNew
    ? { label: 'new', cls: 'cv-changes-op--new' }
    : { label: 'mod', cls: 'cv-changes-op--mod' };

  const fileName = change.filePath.split('/').slice(-2).join('/');

  return (
    <li className="cv-change-row">
      <button className="cv-change-main" onClick={() => setOpen((v) => !v)}>
        <span className={`cv-changes-op ${opBadge.cls}`}>{opBadge.label}</span>
        <span className="cv-change-path" title={change.filePath}>{fileName}</span>
        {(change.linesAdded !== undefined || change.linesRemoved !== undefined) && (
          <span className="cv-change-stats">
            {change.linesAdded ? <span className="cv-change-add">+{change.linesAdded}</span> : null}
            {change.linesRemoved ? <span className="cv-change-rem"> -{change.linesRemoved}</span> : null}
          </span>
        )}
        <span className="cv-change-toggle">{open ? '▲' : '▼'}</span>
        {/* Per-file actions */}
        <span className="cv-change-row-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="cv-changes-btn cv-changes-btn--approve cv-changes-btn--sm"
            onClick={handleApprove}
            disabled={approve.isPending || rollback.isPending}
            title="Одобрить"
          >✓</button>
          <button
            className="cv-changes-btn cv-changes-btn--rollback cv-changes-btn--sm"
            onClick={handleRollback}
            disabled={rollback.isPending || approve.isPending}
            title="Откатить"
          >✕</button>
        </span>
      </button>
      {open && (
        <div className="cv-change-diff">
          {diffQuery.isLoading && <span className="cv-change-diff-loading">Загрузка diff...</span>}
          {diffQuery.data && <DiffView diff={diffQuery.data.diff} />}
          {diffQuery.isError && <span className="cv-change-diff-err">Не удалось загрузить diff</span>}
        </div>
      )}
    </li>
  );
}

function pluralFiles(n: number): string {
  if (n % 10 === 1 && n % 100 !== 11) return 'файл';
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'файла';
  return 'файлов';
}

// ─── Existing components below (unchanged) ───────────────────────────────────

function StepRow({ step, isStreaming }: { step: TurnStep; isLast: boolean; isStreaming: boolean }) {
  switch (step.type) {
    case 'thinking': {
      const content = step.content?.trim() ?? '';
      if (isNoisyThinking(content)) return null;
      return (
        <div className="cv-step cv-step--insight">
          <div className={`cv-step-dot cv-step-dot--insight ${isStreaming ? 'cv-step-dot--pulse' : ''}`} />
          <div className="cv-step-body">
            <MarkdownViewer className="cv-thinking-md">{content}</MarkdownViewer>
          </div>
        </div>
      );
    }

    case 'tool_use':
      return <ToolRow step={step} isStreaming={isStreaming} />;

    // Legacy: old session data may still have tool_result steps
    case 'tool_result':
      return (
        <div className="cv-step">
          <div className={`cv-step-dot cv-step-dot--result-${step.success ? 'ok' : 'err'}`} />
          <div className="cv-step-body">
            <span className="cv-step-label">
              <span className="cv-tool-name">{formatToolName(step.toolName)}</span>
              {step.durationMs !== undefined && <span className="cv-step-duration">{step.durationMs}ms</span>}
            </span>
            {!step.success && step.error && <p className="cv-step-error-text">{step.error}</p>}
          </div>
        </div>
      );

    case 'subagent':
      return (
        <div className="cv-step">
          <div className="cv-step-dot cv-step-dot--tool" />
          <div className="cv-step-body">
            <span className="cv-step-label">
              <span className="cv-tool-name">Agent: {step.agentName}</span>
              <span className="cv-step-meta"> — {step.task?.slice(0, 60)}{(step.task?.length ?? 0) > 60 ? '…' : ''}</span>
            </span>
          </div>
        </div>
      );

    case 'error':
      return (
        <div className="cv-step">
          <div className="cv-step-dot cv-step-dot--result-err" />
          <div className="cv-step-body">
            <span className="cv-step-label cv-step-label--err">{step.code}</span>
            <p className="cv-step-error-text">{step.message}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}

/** Per-tool expandable content — each tool type shows what's actually useful */
function ToolDetails({
  step,
  hasDiff,
  hasOutput,
}: {
  step: import('@kb-labs/agent-contracts').ToolUseStep;
  hasDiff: boolean;
  hasOutput: boolean;
}) {
  const input = step.input as Record<string, unknown> | null | undefined;
  const toolLower = step.toolName.toLowerCase();

  const isWrite = toolLower.includes('write') || toolLower.includes('patch') || toolLower.includes('edit');
  const isRead = toolLower.includes('read');
  const isShell = toolLower.includes('bash') || toolLower.includes('exec') || toolLower.includes('shell') || toolLower.includes('run');
  const isSearch = toolLower.includes('grep') || toolLower.includes('search') || toolLower.includes('glob') || toolLower.includes('list') || toolLower.includes('rag');

  // fs:write / fs:patch / fs:edit → diff if available, else file content
  if (isWrite) {
    if (hasDiff) {
      return <DiffView diff={step.metadata!.diff!} />;
    }
    const content = (input?.content ?? input?.new_content ?? input?.text) as string | undefined;
    if (content) {
      const filePath = (input?.path ?? input?.filePath ?? input?.file_path ?? input?.file) as string | undefined;
      const ext = filePath ? filePath.split('.').pop() : undefined;
      return (
        <div className="cv-code-block">
          {filePath && <div className="cv-code-block-header">{filePath}</div>}
          <pre className={`cv-tool-output cv-tool-output--code${ext ? ` lang-${ext}` : ''}`}>{String(content)}</pre>
        </div>
      );
    }
    return null;
  }

  // fs:read → file content
  if (isRead && hasOutput) {
    return <pre className="cv-tool-output cv-tool-output--code">{formatOutput(step.output)}</pre>;
  }

  // bash/shell → terminal output
  if (isShell && hasOutput) {
    return <pre className="cv-tool-output cv-tool-output--terminal">{formatOutput(step.output)}</pre>;
  }

  // search/grep/glob/rag → result list or text
  if (isSearch && hasOutput) {
    return <pre className="cv-tool-output">{formatOutput(step.output)}</pre>;
  }

  // fallback — diff if exists, else output
  if (hasDiff) {
    return <DiffView diff={step.metadata!.diff!} />;
  }
  if (hasOutput) {
    return <pre className="cv-tool-output">{formatOutput(step.output)}</pre>;
  }
  return null;
}

function ToolRow({ step, isStreaming }: { step: import('@kb-labs/agent-contracts').ToolUseStep; isStreaming: boolean }) {
  const [open, setOpen] = React.useState(false);
  const isPending = step.status === 'pending';
  const isDone = step.status === 'done';
  const isError = step.status === 'error';
  const hasOutput = isDone && step.output !== undefined && step.output !== null;
  const hasDiff = isDone && !!step.metadata?.diff;
  const toolLowerCheck = step.toolName.toLowerCase();
  const isWriteTool = toolLowerCheck.includes('write') || toolLowerCheck.includes('patch') || toolLowerCheck.includes('edit');
  const hasWriteContent = isWriteTool && isDone && !!(
    (step.input as Record<string, unknown> | null | undefined)?.content ??
    (step.input as Record<string, unknown> | null | undefined)?.new_content
  );
  const canExpand = hasOutput || hasDiff || hasWriteContent;

  const dotClass = isPending
    ? isStreaming ? 'cv-step-dot--pulse' : 'cv-step-dot--tool'
    : isDone ? 'cv-step-dot--result-ok'
    : 'cv-step-dot--result-err';

  const meta = getToolMeta(step);

  return (
    <div className="cv-step cv-step--tool">
      <div className={`cv-step-dot ${dotClass}`} />
      <div className="cv-step-body">
        {/* Header row: name · meta · toggle */}
        <button
          className={`cv-tool-header${canExpand ? ' cv-tool-header--clickable' : ''}`}
          onClick={() => canExpand && setOpen((v) => !v)}
          disabled={!canExpand}
        >
          <span className="cv-tool-name">{formatToolName(step.toolName)}</span>
          {meta.badge && <span className="cv-tool-badge">{meta.badge}</span>}
          {/* Rich metadata badges */}
          {isDone && step.metadata?.resultCount !== undefined && (
            <span className="cv-tool-badge">{step.metadata.resultCount} results</span>
          )}
          {isDone && step.metadata?.confidence !== undefined && (
            <span className="cv-tool-badge">{Math.round(step.metadata.confidence * 100)}%</span>
          )}
          {isDone && step.metadata?.exitCode !== undefined && step.metadata.exitCode !== 0 && (
            <span className="cv-tool-badge cv-tool-badge--err">exit {step.metadata.exitCode}</span>
          )}
          {/* Line stats for patch/edit — show +/- even without stored diff */}
          {isDone && (step.metadata?.linesAdded !== undefined || step.metadata?.linesRemoved !== undefined) && (
            <span className="cv-tool-badge cv-tool-badge--diff">
              {step.metadata.linesAdded !== undefined && step.metadata.linesAdded > 0 ? `+${step.metadata.linesAdded}` : ''}
              {step.metadata.linesRemoved !== undefined && step.metadata.linesRemoved > 0 ? ` -${step.metadata.linesRemoved}` : ''}
            </span>
          )}
          {/* Line count for write tools (total lines written) */}
          {isDone && step.metadata?.lines !== undefined && step.metadata?.linesAdded === undefined && (
            <span className="cv-tool-badge">{step.metadata.lines} lines</span>
          )}
          {!isPending && step.durationMs !== undefined && (
            <span className="cv-step-duration">{step.durationMs}ms</span>
          )}
          {canExpand && (
            <span className="cv-tool-toggle">{open ? '▲' : '▼'}</span>
          )}
        </button>

        {/* Why / what the agent is doing */}
        {meta.summary && (
          <p className="cv-tool-summary">
            {meta.filePath ? (
              <CopyPath path={meta.filePath} label={meta.summary} />
            ) : (
              meta.summary
            )}
          </p>
        )}

        {/* Todo inline checklist — rendered from backend snapshot */}
        {isDone && step.metadata?.uiHint === 'todo' && step.metadata.structured && (
          <TodoView todoList={step.metadata.structured.todoList as TodoListData} />
        )}

        {/* Error */}
        {isError && step.error && (
          <p className="cv-step-error-text">{step.error}</p>
        )}

        {/* Expandable details */}
        {open && (
          <div className="cv-tool-details">
            <ToolDetails step={step} hasDiff={hasDiff} hasOutput={hasOutput} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Todo list data shape from backend structured metadata */
interface TodoItemData {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface TodoListData {
  sessionId: string;
  items: TodoItemData[];
}

const TODO_STATUS_ICON: Record<string, string> = {
  'completed': '✓',
  'in-progress': '◉',
  'blocked': '✗',
  'pending': '○',
};

/** Renders a todo checklist from backend snapshot */
function TodoView({ todoList }: { todoList?: TodoListData }) {
  if (!todoList?.items?.length) return null;
  const completed = todoList.items.filter((i) => i.status === 'completed').length;
  return (
    <div className="cv-todo">
      <div className="cv-todo-progress">{completed}/{todoList.items.length}</div>
      <ul className="cv-todo-list">
        {todoList.items.map((item) => (
          <li key={item.id} className={`cv-todo-item cv-todo-item--${item.status}`}>
            <span className="cv-todo-icon">{TODO_STATUS_ICON[item.status] ?? '○'}</span>
            <span className="cv-todo-desc">{item.description}</span>
            {item.priority !== 'medium' && (
              <span className="cv-todo-priority">{item.priority}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Renders a unified diff with syntax highlighting via CSS classes */
function DiffView({ diff }: { diff: string }) {
  const lines = diff.split('\n');
  return (
    <pre className="cv-tool-output cv-diff">
      {lines.map((line, i) => {
        const cls = line.startsWith('+') && !line.startsWith('+++')
          ? 'cv-diff-add'
          : line.startsWith('-') && !line.startsWith('---')
          ? 'cv-diff-remove'
          : line.startsWith('@@')
          ? 'cv-diff-hunk'
          : '';
        return (
          <span key={i} className={cls}>{line}{'\n'}</span>
        );
      })}
    </pre>
  );
}

/** Inline component: renders a copyable file path link */
function CopyPath({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(path).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button className="cv-copy-path" onClick={handleClick} title={`Copy path: ${path}`}>
      {copied ? '✓ copied' : label}
    </button>
  );
}

/** Extract badge (line count, match count, etc.) and summary from tool input */
function getToolMeta(step: import('@kb-labs/agent-contracts').ToolUseStep): { badge?: string; summary?: string; filePath?: string } {
  const input = step.input as Record<string, unknown> | null | undefined;
  if (!input) return {};

  const toolLower = step.toolName.toLowerCase();

  // For write/edit/patch tools — show file path, NOT content (content goes in expanded area)
  const isWrite = toolLower.includes('write') || toolLower.includes('patch') || toolLower.includes('edit');
  const isRead = toolLower.includes('read');

  // File path — for read/write/patch/edit tools
  const path = (input.path ?? input.filePath ?? input.file_path ?? input.file) as string | undefined;
  if (path) {
    const fileName = String(path).split('/').pop() ?? String(path);
    let badge: string | undefined;
    if (isRead) {
      // Show line range for read tools
      const offset = input.offset ?? input.startLine ?? input.start_line;
      const limit = input.limit ?? input.endLine ?? input.end_line;
      if (offset !== undefined && limit !== undefined) {
        badge = `${offset}–${Number(offset) + Number(limit)}`;
      } else if (limit !== undefined) {
        badge = `${limit} lines`;
      }
    } else if (!isWrite) {
      // For non-file tools that happen to have a path field, show line range
      const startLine = input.startLine ?? input.start_line ?? input.offset;
      const endLine = input.endLine ?? input.end_line ?? input.limit;
      if (startLine !== undefined && endLine !== undefined) {
        badge = `${startLine}–${endLine}`;
      }
    }
    return { summary: fileName, filePath: String(path), badge };
  }

  // Search/grep: show query
  const query = (input.query ?? input.text ?? input.pattern ?? input.search) as string | undefined;
  if (query) {
    const short = String(query).slice(0, 100);
    return { summary: short };
  }

  // Command
  const command = (input.command ?? input.cmd) as string | undefined;
  if (command) {
    return { summary: String(command).slice(0, 100) };
  }

  // For write tools without a path field — just return empty (content shown in expanded area)
  if (isWrite) return {};

  // Content/message fallback — only for non-write tools
  const content = (input.content ?? input.message) as string | undefined;
  if (content) {
    return { summary: String(content).slice(0, 100) };
  }

  return {};
}

/** Normalize tool name to Claude Code style (Read, Write, Edit, Bash, Glob, Grep…) */
function formatToolName(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/[_-]/g, ' ');
  if (normalized.includes('fs read') || normalized.includes('read file')) return 'Read';
  if (normalized.includes('fs write') || normalized.includes('write file')) return 'Write';
  if (normalized.includes('fs patch') || normalized.includes('patch file')) return 'Edit';
  if (normalized.includes('fs edit') || normalized.includes('edit file')) return 'Edit';
  if (normalized.includes('fs delete') || normalized.includes('delete file') || normalized.includes('remove file')) return 'Delete';
  if (normalized.includes('fs list') || normalized.includes('list files') || normalized.includes('glob')) return 'Glob';
  if (normalized.includes('grep') || normalized.includes('search content')) return 'Grep';
  if (normalized.includes('bash') || normalized.includes('exec') || normalized.includes('shell') || normalized.includes('run command')) return 'Bash';
  if (normalized.includes('rag') || normalized.includes('mind')) return 'Mind';
  if (normalized.includes('todo')) return 'TodoWrite';

  // Strip namespace prefix (fs:read → Read, shell:exec → Exec)
  const colonIdx = name.indexOf(':');
  const base = colonIdx >= 0 ? name.slice(colonIdx + 1) : name;
  return base
    .replace(/[_-]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Thinking texts that are purely internal noise — hide completely */
function isNoisyThinking(content: string): boolean {
  const t = content.trim().toLowerCase();
  // Synthetic placeholders generated by status:change events — not real agent reasoning
  if (t === '[executing tools...]' || t === '[thinking...]' || t === '[planning...]' || t === '[analyzing...]') return true;
  if (t === 'analyzing context and choosing the next step.') return true;
  if (t.startsWith('checking facts with tool:') || t.startsWith('running step with tool:') || t.startsWith('running the next step')) return true;
  // Truly empty or trivial
  if (t === 'done.' || t === 'ok.' || t === 'done' || t === 'ok') return true;
  return false;
}

function isInternalProgressText(content: string): boolean {
  return isNoisyThinking(content);
}

/** Format tool output for display */
function formatOutput(output: unknown): string {
  if (typeof output === 'string') return output.slice(0, 2000);
  try {
    return JSON.stringify(output, null, 2).slice(0, 2000);
  } catch {
    return String(output).slice(0, 2000);
  }
}

// Kept for potential future use; avoids unused import warning
void (getToolSummary as unknown);
/** Extract a short human-readable summary from tool input */
function getToolSummary(input: unknown): React.ReactNode {
  if (!input || typeof input !== 'object') return null;
  const obj = input as Record<string, unknown>;

  const text =
    (obj.query as string) ||
    (obj.text as string) ||
    (obj.path as string) ||
    (obj.pattern as string) ||
    (obj.command as string) ||
    (obj.content as string) ||
    (obj.message as string) ||
    null;

  if (!text) return null;
  const short = String(text).slice(0, 80);
  return <span className="cv-step-meta"> {short}{String(text).length > 80 ? '…' : ''}</span>;
}
