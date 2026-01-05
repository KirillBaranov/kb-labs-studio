/**
 * @module @kb-labs/studio-app/modules/commit/components/commits-tab
 * Commits tab - GitHub/GitLab style commit plan viewer
 */

import { useState } from 'react';
import { Button, Card, Empty, Alert, Spin, Collapse, Typography, Badge, message } from 'antd';
import {
  ThunderboltOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const { Panel } = Collapse;
const { Text, Link } = Typography;

interface CommitsTabProps {
  selectedScope: string;
}

export function CommitsTab({ selectedScope }: CommitsTabProps) {
  const sources = useDataSources();
  const queryClient = useQueryClient();
  const [expandedCommits, setExpandedCommits] = useState<string[]>([]);

  // Fetch status (includes filesChanged, commitsInPlan, hasPlan)
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['commit', 'status', selectedScope],
    queryFn: () => sources.commit.getStatus(selectedScope),
    enabled: !!selectedScope,
    staleTime: 5000,
    refetchOnMount: true,
  });

  // Fetch plan (only when we need the full plan with commits)
  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['commit', 'plan', selectedScope],
    queryFn: () => sources.commit.getPlan(selectedScope),
    enabled: !!selectedScope && !!statusData?.hasPlan,
    staleTime: 10000,
  });

  // Generate plan mutation
  const generateMutation = useMutation({
    mutationFn: () => sources.commit.generatePlan({ scope: selectedScope }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commit', 'plan', selectedScope] });
      queryClient.invalidateQueries({ queryKey: ['commit', 'status', selectedScope] });
      queryClient.invalidateQueries({ queryKey: ['commit', 'git-status', selectedScope] });
    },
  });

  // Apply commits mutation
  const applyMutation = useMutation({
    mutationFn: () => sources.commit.applyCommits({ scope: selectedScope }),
    onSuccess: (data) => {
      // Check if backend operation actually succeeded
      if (data.result.success) {
        message.success(`${data.result.appliedCommits.length} commit(s) applied successfully`);
        queryClient.invalidateQueries({ queryKey: ['commit', 'plan', selectedScope] });
        queryClient.invalidateQueries({ queryKey: ['commit', 'status', selectedScope] });
        queryClient.invalidateQueries({ queryKey: ['commit', 'git-status', selectedScope] });
      } else {
        // Errors shown via Alert banner below
      }
    },
    onError: (error: Error) => {
      message.error(`Failed to apply commits: ${error.message}`);
    },
  });

  // Push mutation
  const pushMutation = useMutation({
    mutationFn: () => sources.commit.pushCommits({ scope: selectedScope }),
    onSuccess: (data) => {
      if (data.result.success) {
        message.success('Commits pushed to remote successfully');
        queryClient.invalidateQueries({ queryKey: ['commit', 'plan', selectedScope] });
        queryClient.invalidateQueries({ queryKey: ['commit', 'status', selectedScope] });
      }
    },
    onError: (error: Error) => {
      message.error(`Failed to push commits: ${error.message}`);
    },
  });

  if (!selectedScope) {
    return (
      <Empty
        description="Please select a scope to continue"
        style={{ marginTop: 48 }}
      />
    );
  }

  if (statusLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  const filesChanged = statusData?.filesChanged || 0;
  const hasPlan = statusData?.hasPlan || false;
  const planStatus = statusData?.planStatus || 'idle';
  const commits = planData?.plan?.commits || [];

  // Status badge configuration
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { text: string; status: 'default' | 'processing' | 'success' | 'warning' }> = {
      idle: { text: 'No Plan', status: 'default' },
      ready: { text: 'Ready to Apply', status: 'processing' },
      applied: { text: 'Applied', status: 'success' },
      pushed: { text: 'Pushed', status: 'success' },
    };
    return statusConfig[status] || statusConfig.idle;
  };

  return (
    <div>
      {/* Header - GitHub style */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <Badge {...getStatusBadge(planStatus)} />
            <Text type="secondary">
              {commits.length} {commits.length === 1 ? 'commit' : 'commits'}
            </Text>
            <Text type="secondary">
              {filesChanged} {filesChanged === 1 ? 'file' : 'files'} changed
            </Text>
          </div>

          {hasPlan && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending || planStatus === 'applied' || planStatus === 'pushed'}
              >
                {applyMutation.isPending ? 'Applying...' : 'Apply all'}
              </Link>
              <Text type="secondary">•</Text>
              <Link
                onClick={() => pushMutation.mutate()}
                disabled={pushMutation.isPending || planStatus === 'ready' || planStatus === 'idle'}
              >
                {pushMutation.isPending ? 'Pushing...' : 'Push'}
              </Link>
              <Text type="secondary">•</Text>
              <Link onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Apply Error Banner - only show errors */}
      {applyMutation.isSuccess && applyMutation.data?.result && !applyMutation.data.result.success && (
        <Alert
          message="Failed to Apply Commits"
          description={
            <div>
              {applyMutation.data.result.errors.map((error, i) => (
                <div key={i} style={{ marginBottom: i < applyMutation.data.result.errors.length - 1 ? 8 : 0 }}>
                  • {error}
                </div>
              ))}
            </div>
          }
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Push Error Banner - only show errors */}
      {pushMutation.isSuccess && pushMutation.data?.result && !pushMutation.data.result.success && (
        <Alert
          message="Failed to Push"
          description={pushMutation.data.result.message || 'Push failed'}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Main Content */}
      {!hasPlan || commits.length === 0 ? (
        <Card>
          <Empty
            description={
              <div>
                <Text type="secondary" style={{ fontSize: 14 }}>No commit plan yet</Text>
              </div>
            }
          >
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
              disabled={filesChanged === 0}
            >
              Generate Plan
            </Button>
          </Empty>
        </Card>
      ) : (
        <>

          {/* Commits List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {commits.map((commit: any, index: number) => {
              const commitKey = `commit-${index}`;
              const isExpanded = expandedCommits.includes(commitKey);

              return (
                <Card
                  key={commitKey}
                  size="small"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setExpandedCommits(prev =>
                      prev.includes(commitKey)
                        ? prev.filter(k => k !== commitKey)
                        : [...prev, commitKey]
                    );
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: isExpanded ? 16 : 0 }}>
                    {/* Expand icon */}
                    <RightOutlined
                      rotate={isExpanded ? 90 : 0}
                      style={{ fontSize: 12 }}
                    />

                    {/* Color indicator */}
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getTypeColor(commit.type),
                      flexShrink: 0,
                    }} />

                    {/* Commit message */}
                    <Text>
                      <Text strong>{commit.type}</Text>
                      {commit.scope && <Text type="secondary">({commit.scope})</Text>}
                      {': '}
                      {commit.message || commit.subject}
                    </Text>

                    {commit.breaking && (
                      <Text type="danger" strong style={{ fontSize: 11 }}>BREAKING</Text>
                    )}
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div>
                      {/* Commit Body */}
                      {commit.body && (
                        <div style={{ marginBottom: 16 }}>
                          <Text type="secondary" style={{ whiteSpace: 'pre-wrap' }}>{commit.body}</Text>
                        </div>
                      )}

                      {/* Files List */}
                      {commit.files && commit.files.length > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                            {commit.files.length} {commit.files.length === 1 ? 'file' : 'files'} changed
                          </Text>
                          <Card size="small">
                            {commit.files.map((file: string, fileIndex: number) => (
                              <div
                                key={fileIndex}
                                style={{
                                  padding: '4px 0',
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                }}
                              >
                                <Text code>{file}</Text>
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
                                <> · {(commit.reasoning.confidence * 100).toFixed(0)}% confidence</>
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
        </>
      )}
    </div>
  );
}

// GitHub-style muted colors for commit types
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    feat: '#3fb950',    // GitHub green
    fix: '#f85149',     // GitHub red
    docs: '#58a6ff',    // GitHub blue
    style: '#a371f7',   // GitHub purple
    refactor: '#79c0ff', // GitHub light blue
    test: '#f778ba',    // GitHub pink
    chore: '#8b949e',   // GitHub gray
    perf: '#e3b341',    // GitHub yellow
    ci: '#1f6feb',      // GitHub dark blue
    build: '#58a6ff',   // GitHub blue
  };
  return colors[type] || '#8b949e';
}
