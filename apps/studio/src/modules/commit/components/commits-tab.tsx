/**
 * @module @kb-labs/studio-app/modules/commit/components/commits-tab
 * Commits tab - commit plan viewer with per-commit actions
 */

import { useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Alert,
  Spin,
  Typography,
  Badge,
  message,
  Checkbox,
  Space,
  Modal,
  Dropdown,
  Input,
  Popconfirm,
  Tag,
  Tooltip,
} from 'antd';
import {
  ThunderboltOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  FileOutlined,
  MoreOutlined,
} from '@ant-design/icons';
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

const { Text } = Typography;

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
      Modal.confirm({
        title: 'Allow Secrets Confirmation',
        icon: <ExclamationCircleOutlined />,
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
    Modal.error({
      title: 'Secrets Detected',
      icon: <ExclamationCircleOutlined />,
      width: 700,
      content: (
        <div>
          <Alert message={msg} type="error" showIcon style={{ marginBottom: 16 }} />
          <Text strong>Detected {secrets.length} potential secret(s):</Text>
          <div style={{ maxHeight: 400, overflow: 'auto', marginTop: 8, marginBottom: 16 }}>
            {secrets.map((secret, idx) => (
              <Card key={idx} size="small" style={{ marginBottom: 8 }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>{secret.file}:{secret.line}:{secret.column}</Text>
                  <Text type="secondary">Type: {secret.type}</Text>
                  <Text code style={{ whiteSpace: 'pre-wrap' }}>{secret.context}</Text>
                  <Text type="danger" strong>Matched: {secret.matched}</Text>
                </Space>
              </Card>
            ))}
          </div>
          <Alert
            message="What to do?"
            description="1. Remove real secrets and use environment variables. 2. If false positives, check 'Allow secrets' and try again."
            type="info"
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
            message.success(`${data.result.appliedCommits.length} commit(s) applied`);
            setSelectedCommitIds(new Set());
          }
        },
        onError: (error: Error) => message.error(`Apply failed: ${error.message}`),
      }
    );
  };

  const handlePush = () => {
    pushMutation.mutate(
      { scope: selectedScope },
      {
        onSuccess: (data) => {
          if (data.result.success) message.success('Pushed to remote');
        },
        onError: (error: Error) => message.error(`Push failed: ${error.message}`),
      }
    );
  };

  const handleReset = () => {
    resetMutation.mutate(
      { scope: selectedScope },
      {
        onSuccess: () => {
          message.success('Plan reset');
          setSelectedCommitIds(new Set());
          setExpandedCommits([]);
        },
        onError: (error: Error) => message.error(`Reset failed: ${error.message}`),
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
          message.success('Commit message updated');
        },
        onError: (error: Error) => message.error(`Update failed: ${error.message}`),
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
          message.success('Commit regenerated');
        },
        onError: (error: Error) => {
          setRegeneratingCommitId(null);
          message.error(`Regenerate failed: ${error.message}`);
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
    return <Empty description="Select a scope to continue" style={{ marginTop: 48 }} />;
  }

  if (statusLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
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
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Badge {...badge} />
            <Text type="secondary">
              {commits.length} {commits.length === 1 ? 'commit' : 'commits'}
            </Text>
            <Text type="secondary">
              {filesChanged} {filesChanged === 1 ? 'file' : 'files'} changed
            </Text>
          </div>

          {hasPlan && (
            <Space size={8}>
              {/* Apply button (with dropdown for selective) */}
              {planStatus === 'ready' && (
                selectedCount > 0 ? (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApply([...selectedCommitIds])}
                    loading={applyMutation.isPending}
                    disabled={isAnyMutating}
                  >
                    Apply Selected ({selectedCount})
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleApply()}
                    loading={applyMutation.isPending}
                    disabled={isAnyMutating}
                  >
                    Apply All
                  </Button>
                )
              )}

              {/* Push button */}
              {(planStatus === 'applied' || planStatus === 'pushed') && (
                <Button
                  size="small"
                  icon={<CloudUploadOutlined />}
                  onClick={handlePush}
                  loading={pushMutation.isPending}
                  disabled={isAnyMutating}
                >
                  Push
                </Button>
              )}

              {/* Regenerate All */}
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={handleGenerateClick}
                loading={generateMutation.isPending}
                disabled={isAnyMutating}
              >
                Regenerate All
              </Button>

              {/* Reset Plan */}
              <Popconfirm
                title="Reset commit plan?"
                description="This will delete the current plan. You can generate a new one."
                onConfirm={handleReset}
                okText="Reset"
                okType="danger"
              >
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={resetMutation.isPending}
                  disabled={isAnyMutating}
                >
                  Reset
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>
      </Card>

      {/* Error Banners */}
      {applyMutation.isSuccess && applyMutation.data?.result && !applyMutation.data.result.success && (
        <Alert
          message="Apply Failed"
          description={applyMutation.data.result.errors.map((e, i) => <div key={i}>{e}</div>)}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Generating indicator */}
      {generateMutation.isPending && (
        <Card style={{ marginBottom: 16, textAlign: 'center' }}>
          <Spin style={{ marginRight: 12 }} />
          <Text type="secondary">Analyzing {filesChanged} files and generating commit plan...</Text>
        </Card>
      )}

      {/* Empty State */}
      {!hasPlan || commits.length === 0 ? (
        !generateMutation.isPending && (
          <Card style={{ textAlign: 'center', padding: '48px 0' }}>
            <FileOutlined style={{ fontSize: 48, color: '#8c8c8c', display: 'block', marginBottom: 16 }} />
            <Text type="secondary" style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>
              No commit plan yet
            </Text>
            {filesChanged > 0 && (
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 24 }}>
                {filesChanged} {filesChanged === 1 ? 'file' : 'files'} changed
              </Text>
            )}
            <Space direction="vertical" align="center">
              <Checkbox
                checked={allowSecrets}
                onChange={(e) => setAllowSecrets(e.target.checked)}
                style={{ marginBottom: 8 }}
              >
                <Text type="secondary" style={{ fontSize: 13 }}>Allow secrets</Text>
              </Checkbox>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleGenerateClick}
                loading={generateMutation.isPending}
                disabled={filesChanged === 0}
              >
                Generate Plan
              </Button>
            </Space>
          </Card>
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
              <Card key={commitId} size="small" style={{ opacity: isRegenerating ? 0.6 : 1 }}>
                {/* Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isExpanded ? 16 : 0 }}>
                  {/* Checkbox for selective apply (only in ready state) */}
                  {planStatus === 'ready' && (
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleCommitSelection(commitId)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {/* Expand toggle */}
                  <RightOutlined
                    rotate={isExpanded ? 90 : 0}
                    style={{ fontSize: 11, cursor: 'pointer', color: '#8c8c8c' }}
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
                        <Input
                          size="small"
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          onPressEnter={() => handleSaveEdit(commitId)}
                          autoFocus
                          style={{ flex: 1 }}
                        />
                        <Button
                          size="small"
                          type="text"
                          icon={<CheckOutlined />}
                          onClick={() => handleSaveEdit(commitId)}
                          loading={patchMutation.isPending}
                        />
                        <Button
                          size="small"
                          type="text"
                          icon={<CloseOutlined />}
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
                    <Tag color="red" style={{ margin: 0 }}>BREAKING</Tag>
                  )}

                  {/* File count */}
                  <Tooltip title={`${commit.files?.length || 0} files`}>
                    <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                      {commit.files?.length || 0} files
                    </Text>
                  </Tooltip>

                  {/* Confidence */}
                  {commit.reasoning?.confidence !== undefined && (
                    <Tooltip title="AI confidence">
                      <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {(commit.reasoning.confidence * 100).toFixed(0)}%
                      </Text>
                    </Tooltip>
                  )}

                  {/* Actions menu */}
                  {planStatus === 'ready' && !isEditing && (
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: 'Edit message',
                            icon: <EditOutlined />,
                            onClick: () => handleStartEdit(commitId, commit.message),
                          },
                          {
                            key: 'regenerate',
                            label: 'Regenerate commit',
                            icon: <ReloadOutlined />,
                            onClick: () => handleRegenerate(commitId),
                          },
                        ],
                      }}
                    >
                      <Button
                        type="text"
                        size="small"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  )}
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div>
                    {/* Regenerating spinner */}
                    {isRegenerating && (
                      <div style={{ textAlign: 'center', padding: 16 }}>
                        <Spin size="small" />
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
                        <Card size="small" style={{ background: 'rgba(0,0,0,0.02)' }}>
                          {commit.files.map((file: string, i: number) => (
                            <div key={i} style={{ padding: '3px 0', fontFamily: 'monospace', fontSize: 12 }}>
                              {file}
                            </div>
                          ))}
                        </Card>
                      </div>
                    )}

                    {/* AI Reasoning */}
                    {commit.reasoning && (
                      <Alert
                        message="AI Reasoning"
                        description={
                          <Text type="secondary">
                            {commit.reasoning.explanation}
                            {commit.reasoning.confidence !== undefined && (
                              <> ({(commit.reasoning.confidence * 100).toFixed(0)}% confidence)</>
                            )}
                          </Text>
                        }
                        type="info"
                        style={{ marginTop: 16 }}
                      />
                    )}
                  </div>
                )}
              </Card>
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
