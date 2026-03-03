/**
 * @module @kb-labs/studio-app/modules/commit/components/commits-tab
 * Commits tab - commit plan viewer with per-commit actions
 */

import { useState } from 'react';
import {
  UIButton,
  UICard,
  UIEmptyState,
  UIAlert,
  UISpin,
  UITypographyText,
  UIBadge,
  UIMessage,
  UICheckbox,
  UISpace,
  UIModal, UIModalError, UIModalConfirm,
  UIDropdown,
  UIInput,
  UIPopconfirm,
  UITag,
  UITooltip,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useCommitStatus,
  useCommitPlan,
  useGeneratePlan,
  useApplyCommits,
  usePushCommits,
  useResetPlan,
  usePatchPlan,
  useRegenerateCommit,
} from '@kb-labs/studio-data-client';

const Text = UITypographyText;

interface CommitsTabProps {
  selectedScope: string;
}

export function CommitsTab({ selectedScope }: CommitsTabProps) {
  const sources = useDataSources();
  const [expandedCommits, setExpandedCommits] = useState<string[]>([]);
  const [allowSecrets, setAllowSecrets] = useState(false);
  const [selectedCommitIds, setSelectedCommitIds] = useState<Set<string>>(new Set());
  const [editingCommitId, setEditingCommitId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [regeneratingCommitId, setRegeneratingCommitId] = useState<string | null>(null);

  // Queries
  const { data: statusData, isLoading: statusLoading } = useCommitStatus(sources.commit, selectedScope, !!selectedScope);
  const { data: planData } = useCommitPlan(sources.commit, selectedScope, !!selectedScope);

  // Mutations
  const generateMutation = useGeneratePlan(sources.commit);
  const applyMutation = useApplyCommits(sources.commit);
  const pushMutation = usePushCommits(sources.commit);
  const resetMutation = useResetPlan(sources.commit);
  const patchMutation = usePatchPlan(sources.commit);
  const regenerateMutation = useRegenerateCommit(sources.commit);

  // Derived state
  const filesChanged = statusData?.filesChanged || 0;
  const commits = planData?.plan?.commits || [];
  const hasPlan = statusData?.hasPlan || commits.length > 0;
  const planStatus = hasPlan ? (statusData?.planStatus || 'ready') : 'idle';

  // Handlers
  const handleGenerateClick = () => {
    if (allowSecrets) {
      UIModalConfirm({
        title: 'Allow Secrets Confirmation',
        icon: <UIIcon name="ExclamationCircleOutlined" />,
        content: (
          <div>
            <p>You are about to generate commits for files that may contain secrets.</p>
            <p><Text type="danger" strong>Warning: This bypasses security checks!</Text></p>
          </div>
        ),
        okText: 'Yes, Proceed',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: () => generateMutation.mutate({ scope: selectedScope, allowSecrets: true, autoConfirm: true }),
      });
    } else {
      generateMutation.mutate(
        { scope: selectedScope, allowSecrets: false, autoConfirm: false },
        {
          onSuccess: (data) => {
            if (data.secretsDetected && data.secrets) {
              showSecretsModal(data.secrets, data.message || 'Secrets detected');
            }
          },
        }
      );
    }
  };

  const showSecretsModal = (secrets: any[], msg: string) => {
    UIModalError({
      title: 'Secrets Detected',
      icon: <UIIcon name="ExclamationCircleOutlined" />,
      width: 700,
      content: (
        <div>
          <UIAlert message={msg} variant="error" showIcon style={{ marginBottom: 16 }} />
          <Text strong>Detected {secrets.length} potential secret(s):</Text>
          <div style={{ maxHeight: 400, overflow: 'auto', marginTop: 8, marginBottom: 16 }}>
            {secrets.map((secret, idx) => (
              <UICard key={idx} size="small" style={{ marginBottom: 8 }}>
                <UISpace direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>{secret.file}:{secret.line}:{secret.column}</Text>
                  <Text type="secondary">Type: {secret.type}</Text>
                  <Text code style={{ whiteSpace: 'pre-wrap' }}>{secret.context}</Text>
                  <Text type="danger" strong>Matched: {secret.matched}</Text>
                </UISpace>
              </UICard>
            ))}
          </div>
          <UIAlert
            message="What to do?"
            description="1. Remove real secrets and use environment variables. 2. If false positives, check 'Allow secrets' and try again."
            variant="info"
            showIcon
          />
        </div>
      ),
      okText: 'Close',
      okType: 'default',
    });
  };

  const handleApply = (commitIds?: string[]) => {
    applyMutation.mutate(
      { scope: selectedScope, commitIds },
      {
        onSuccess: (data) => {
          if (data.result.success) {
            UIMessage.success(`${data.result.appliedCommits.length} commit(s) applied`);
            setSelectedCommitIds(new Set());
          }
        },
        onError: (error: Error) => UIMessage.error(`Apply failed: ${error.message}`),
      }
    );
  };

  const handlePush = () => {
    pushMutation.mutate(
      { scope: selectedScope },
      {
        onSuccess: (data) => {
          if (data.result.success) {
            if (data.result.commitsPushed > 0) {
              UIMessage.success(`Pushed ${data.result.commitsPushed} commit(s) to ${data.result.remote}/${data.result.branch}`);
            } else {
              UIMessage.info('No commits to push');
            }
          } else {
            UIMessage.error(data.result.error || 'Push failed');
          }
        },
        onError: (error: Error) => UIMessage.error(`Push failed: ${error.message}`),
      }
    );
  };

  const handleReset = () => {
    resetMutation.mutate(
      { scope: selectedScope },
      {
        onSuccess: () => {
          UIMessage.success('Plan reset');
          setSelectedCommitIds(new Set());
          setExpandedCommits([]);
        },
        onError: (error: Error) => UIMessage.error(`Reset failed: ${error.message}`),
      }
    );
  };

  const handleStartEdit = (commitId: string, currentMessage: string) => {
    setEditingCommitId(commitId);
    setEditMessage(currentMessage);
  };

  const handleSaveEdit = (commitId: string) => {
    patchMutation.mutate(
      { scope: selectedScope, commitId, message: editMessage },
      {
        onSuccess: () => {
          setEditingCommitId(null);
          UIMessage.success('Commit message updated');
        },
        onError: (error: Error) => UIMessage.error(`Update failed: ${error.message}`),
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingCommitId(null);
    setEditMessage('');
  };

  const handleRegenerate = (commitId: string) => {
    setRegeneratingCommitId(commitId);
    regenerateMutation.mutate(
      { scope: selectedScope, commitId },
      {
        onSuccess: () => {
          setRegeneratingCommitId(null);
          UIMessage.success('Commit regenerated');
        },
        onError: (error: Error) => {
          setRegeneratingCommitId(null);
          UIMessage.error(`Regenerate failed: ${error.message}`);
        },
      }
    );
  };

  const toggleCommitSelection = (commitId: string) => {
    setSelectedCommitIds(prev => {
      const next = new Set(prev);
      if (next.has(commitId)) {
        next.delete(commitId);
      } else {
        next.add(commitId);
      }
      return next;
    });
  };

  const toggleExpandCommit = (commitId: string) => {
    setExpandedCommits(prev =>
      prev.includes(commitId)
        ? prev.filter(k => k !== commitId)
        : [...prev, commitId]
    );
  };

  // Guards
  if (!selectedScope) {
    return <UIEmptyState description="Select a scope to continue" style={{ marginTop: 48 }} />;
  }

  if (statusLoading) {
    return <UISpin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // Status badge
  const statusConfig: Record<string, { text: string; status: 'default' | 'processing' | 'success' | 'warning' }> = {
    idle: { text: 'No Plan', status: 'default' },
    ready: { text: 'Ready to Apply', status: 'processing' },
    applied: { text: 'Applied', status: 'success' },
    pushed: { text: 'Pushed', status: 'success' },
  };
  const badge = statusConfig[planStatus] || statusConfig.idle;

  const selectedCount = selectedCommitIds.size;
  const isAnyMutating = applyMutation.isPending || pushMutation.isPending || generateMutation.isPending || resetMutation.isPending;

  return (
    <div>
      {/* Summary Bar */}
      <UICard size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <UIBadge {...badge} />
            <Text type="secondary">
              {commits.length} {commits.length === 1 ? 'commit' : 'commits'}
            </Text>
            <Text type="secondary">
              {filesChanged} {filesChanged === 1 ? 'file' : 'files'} changed
            </Text>
          </div>

          {hasPlan && (
            <UISpace size={8}>
              {/* Apply button (with dropdown for selective) */}
              {planStatus === 'ready' && (
                selectedCount > 0 ? (
                  <UIButton
                    variant="primary"
                    size="small"
                    onClick={() => handleApply([...selectedCommitIds])}
                    loading={applyMutation.isPending}
                    disabled={isAnyMutating}
                  >
                    Apply Selected ({selectedCount})
                  </UIButton>
                ) : (
                  <UIButton
                    variant="primary"
                    size="small"
                    onClick={() => handleApply()}
                    loading={applyMutation.isPending}
                    disabled={isAnyMutating}
                  >
                    Apply All
                  </UIButton>
                )
              )}

              {/* Push button */}
              {(planStatus === 'applied' || planStatus === 'pushed') && (
                <UIButton
                  size="small"
                  icon={<UIIcon name="CloudUploadOutlined" />}
                  onClick={handlePush}
                  loading={pushMutation.isPending}
                  disabled={isAnyMutating}
                >
                  Push
                </UIButton>
              )}

              {/* Regenerate All */}
              <UIButton
                size="small"
                icon={<UIIcon name="ReloadOutlined" />}
                onClick={handleGenerateClick}
                loading={generateMutation.isPending}
                disabled={isAnyMutating}
              >
                Regenerate All
              </UIButton>

              {/* Reset Plan */}
              <UIPopconfirm
                title="Reset commit plan?"
                description="This will delete the current plan. You can generate a new one."
                onConfirm={handleReset}
                okText="Reset"
                okType="danger"
              >
                <UIButton
                  size="small"
                  danger
                  icon={<UIIcon name="DeleteOutlined" />}
                  loading={resetMutation.isPending}
                  disabled={isAnyMutating}
                >
                  Reset
                </UIButton>
              </UIPopconfirm>
            </UISpace>
          )}
        </div>
      </UICard>

      {/* Error Banners */}
      {applyMutation.isSuccess && applyMutation.data?.result && !applyMutation.data.result.success && (
        <UIAlert
          message="Apply Failed"
          description={applyMutation.data.result.errors.map((e, i) => <div key={i}>{e}</div>)}
          variant="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {pushMutation.isSuccess && pushMutation.data?.result && !pushMutation.data.result.success && (
        <UIAlert
          message="Push Failed"
          description={pushMutation.data.result.error || 'Push failed due to remote checks or git errors'}
          variant="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Generating indicator */}
      {generateMutation.isPending && (
        <UICard style={{ marginBottom: 16, textAlign: 'center' }}>
          <UISpin style={{ marginRight: 12 }} />
          <Text type="secondary">Analyzing {filesChanged} files and generating commit plan...</Text>
        </UICard>
      )}

      {/* Empty State */}
      {!hasPlan || commits.length === 0 ? (
        !generateMutation.isPending && (
          <UICard style={{ textAlign: 'center', padding: '48px 0' }}>
            <UIIcon name="FileOutlined" style={{ fontSize: 48, color: '#8c8c8c', display: 'block', marginBottom: 16 }} />
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
              No commit plan yet
            </Text>
            {filesChanged > 0 && (
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
                {filesChanged} {filesChanged === 1 ? 'file' : 'files'} changed
              </Text>
            )}
            <UISpace direction="vertical" align="center">
              <div style={{ marginBottom: 8 }}>
                <UICheckbox
                  checked={allowSecrets}
                  onChange={(checked) => setAllowSecrets(checked)}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>Allow secrets</Text>
                </UICheckbox>
              </div>
              <UIButton
                variant="primary"
                icon={<UIIcon name="ThunderboltOutlined" />}
                onClick={handleGenerateClick}
                loading={generateMutation.isPending}
                disabled={filesChanged === 0}
              >
                Generate Plan
              </UIButton>
            </UISpace>
          </UICard>
        )
      ) : (
        /* Commit Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {commits.map((commit: any) => {
            const commitId = commit.id;
            const isExpanded = expandedCommits.includes(commitId);
            const isEditing = editingCommitId === commitId;
            const isRegenerating = regeneratingCommitId === commitId;
            const isSelected = selectedCommitIds.has(commitId);

            return (
              <UICard key={commitId} size="small" style={{ opacity: isRegenerating ? 0.6 : 1 }}>
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isExpanded ? 16 : 0 }}>
                  {/* Checkbox for selective apply (only in ready state) */}
                  {planStatus === 'ready' && (
                    <span onClick={(e) => e.stopPropagation()}>
                      <UICheckbox
                        checked={isSelected}
                        onChange={() => toggleCommitSelection(commitId)}
                      />
                    </span>
                  )}

                  {/* Expand toggle */}
                  <UIIcon name="RightOutlined"
                    style={{ fontSize: 11, cursor: 'pointer', color: '#8c8c8c', transform: isExpanded ? 'rotate(90deg)' : undefined }}
                    onClick={() => toggleExpandCommit(commitId)}
                  />

                  {/* Type color dot */}
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: getTypeColor(commit.type),
                    flexShrink: 0,
                  }} />

                  {/* Message (editable or static) */}
                  <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => toggleExpandCommit(commitId)}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <UIInput
                          size="small"
                          value={editMessage}
                          onChange={(value) => setEditMessage(value)}
                          onPressEnter={() => handleSaveEdit(commitId)}
                          autoFocus
                          style={{ flex: 1 }}
                        />
                        <UIButton
                          size="small"
                          variant="text"
                          icon={<UIIcon name="CheckOutlined" />}
                          onClick={() => handleSaveEdit(commitId)}
                          loading={patchMutation.isPending}
                        />
                        <UIButton
                          size="small"
                          variant="text"
                          icon={<UIIcon name="CloseOutlined" />}
                          onClick={handleCancelEdit}
                        />
                      </div>
                    ) : (
                      <Text ellipsis>
                        <Text strong>{commit.type}</Text>
                        {commit.scope && <Text type="secondary">({commit.scope})</Text>}
                        {': '}
                        {commit.message}
                      </Text>
                    )}
                  </div>

                  {/* Breaking change badge */}
                  {commit.breaking && (
                    <UITag color="red" style={{ margin: 0 }}>BREAKING</UITag>
                  )}

                  {/* File count */}
                  <UITooltip title={`${commit.files?.length || 0} files`}>
                    <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {commit.files?.length || 0} files
                    </Text>
                  </UITooltip>

                  {/* Confidence */}
                  {commit.reasoning?.confidence !== undefined && (
                    <UITooltip title="AI confidence">
                      <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {(commit.reasoning.confidence * 100).toFixed(0)}%
                      </Text>
                    </UITooltip>
                  )}

                  {/* Actions menu */}
                  {planStatus === 'ready' && !isEditing && (
                    <UIDropdown
                      trigger={['click']}
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: 'Edit message',
                            icon: <UIIcon name="EditOutlined" />,
                            onClick: () => handleStartEdit(commitId, commit.message),
                          },
                          {
                            key: 'regenerate',
                            label: 'Regenerate commit',
                            icon: <UIIcon name="ReloadOutlined" />,
                            onClick: () => handleRegenerate(commitId),
                          },
                        ],
                      }}
                    >
                      <UIButton
                        variant="text"
                        size="small"
                        icon={<UIIcon name="MoreOutlined" />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </UIDropdown>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div>
                    {/* Regenerating spinner */}
                    {isRegenerating && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <UISpin size="small" />
                        <Text type="secondary" style={{ marginLeft: 8 }}>Regenerating...</Text>
                      </div>
                    )}

                    {/* Body */}
                    {commit.body && (
                      <div style={{ marginBottom: 16 }}>
                        <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>{commit.body}</Text>
                      </div>
                    )}

                    {/* Files */}
                    {commit.files && commit.files.length > 0 && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                          {commit.files.length} {commit.files.length === 1 ? 'file' : 'files'}
                        </Text>
                        <UICard size="small" style={{ background: 'rgba(0,0,0,0.02)' }}>
                          {commit.files.map((file: string, i: number) => (
                            <div key={i} style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: 12 }}>
                              {file}
                            </div>
                          ))}
                        </UICard>
                      </div>
                    )}

                    {/* AI Reasoning */}
                    {commit.reasoning && (
                      <UIAlert
                        message="AI Reasoning"
                        description={
                          <Text type="secondary">
                            {commit.reasoning.explanation}
                            {commit.reasoning.confidence !== undefined && (
                              <> ({(commit.reasoning.confidence * 100).toFixed(0)}% confidence)</>
                            )}
                          </Text>
                        }
                        variant="info"
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </div>
                )}
              </UICard>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    feat: '#3fb950',
    fix: '#f85149',
    docs: '#58a6ff',
    style: '#a371f7',
    refactor: '#79c0ff',
    test: '#f778ba',
    chore: '#8b949e',
    perf: '#e3b341',
    ci: '#1f6feb',
    build: '#58a6ff',
  };
  return colors[type] || '#8b949e';
}
