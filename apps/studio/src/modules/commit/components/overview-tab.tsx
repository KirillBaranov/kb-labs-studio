/**
 * @module @kb-labs/studio-app/modules/commit/components/overview-tab
 * Overview tab - workspace status and quick actions
 *
 * TODO: TEMPORARY - Remove after commit plugin UI is polished
 */

import * as React from 'react';
import { useState } from 'react';
import { Select, Button, Space, Statistic, Row, Col, message } from 'antd';
import {
  ThunderboltOutlined,
  CheckOutlined,
  UploadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { KBSection, KBCard, KBSkeleton } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function OverviewTab() {
  const sources = useDataSources();
  const queryClient = useQueryClient();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  // Fetch workspaces
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery({
    queryKey: ['commit', 'workspaces'],
    queryFn: () => sources.commit.getWorkspaces(),
  });

  // Fetch status for selected workspace
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['commit', 'status', selectedWorkspace],
    queryFn: () => sources.commit.getStatus(selectedWorkspace),
    enabled: !!selectedWorkspace,
  });

  // Generate plan mutation
  const generateMutation = useMutation({
    mutationFn: (workspace: string) =>
      sources.commit.generatePlan({ workspace }),
    onSuccess: () => {
      message.success('Commit plan generated successfully');
      queryClient.invalidateQueries({ queryKey: ['commit', 'status', selectedWorkspace] });
      queryClient.invalidateQueries({ queryKey: ['commit', 'plan', selectedWorkspace] });
    },
    onError: (error: Error) => {
      message.error(`Failed to generate plan: ${error.message}`);
    },
  });

  // Apply commits mutation
  const applyMutation = useMutation({
    mutationFn: (workspace: string) =>
      sources.commit.applyCommits({ workspace }),
    onSuccess: () => {
      message.success('Commits applied successfully');
      queryClient.invalidateQueries({ queryKey: ['commit', 'status', selectedWorkspace] });
      queryClient.invalidateQueries({ queryKey: ['commit', 'plan', selectedWorkspace] });
    },
    onError: (error: Error) => {
      message.error(`Failed to apply commits: ${error.message}`);
    },
  });

  // Push commits mutation
  const pushMutation = useMutation({
    mutationFn: (workspace: string) =>
      sources.commit.pushCommits({ workspace }),
    onSuccess: () => {
      message.success('Commits pushed successfully');
    },
    onError: (error: Error) => {
      message.error(`Failed to push commits: ${error.message}`);
    },
  });

  // Auto-select first workspace
  React.useEffect(() => {
    if (workspacesData?.workspaces && workspacesData.workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspacesData.workspaces[0].id);
    }
  }, [workspacesData, selectedWorkspace]);

  if (workspacesLoading) {
    return <KBSkeleton />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Workspace Selector */}
      <KBSection>
        <KBCard>
          <Space direction="vertical" style={{ width: '100%' }}>
            <label>Select Workspace</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Choose monorepo package or repository"
              value={selectedWorkspace}
              onChange={setSelectedWorkspace}
              loading={workspacesLoading}
              showSearch
              options={workspacesData?.workspaces?.map((w) => ({
                label: w.name,
                value: w.id,
                title: w.path,
              })) || []}
            />
          </Space>
        </KBCard>
      </KBSection>

      {/* Status Metrics */}
      {selectedWorkspace && (
        <KBSection>
          <KBCard title="Commit Status">
            {statusLoading ? (
              <KBSkeleton />
            ) : (
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Files Changed"
                    value={statusData?.filesChanged || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Commits in Plan"
                    value={statusData?.commitsInPlan || 0}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Has Plan"
                    value={statusData?.hasPlan ? 'Yes' : 'No'}
                  />
                </Col>
              </Row>
            )}
          </KBCard>
        </KBSection>
      )}

      {/* Quick Actions */}
      {selectedWorkspace && (
        <KBSection>
          <KBCard title="Quick Actions">
            <Space wrap>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => generateMutation.mutate(selectedWorkspace)}
                loading={generateMutation.isPending}
              >
                Generate Plan
              </Button>
              <Button
                icon={<CheckOutlined />}
                onClick={() => applyMutation.mutate(selectedWorkspace)}
                loading={applyMutation.isPending}
                disabled={!statusData?.hasPlan}
              >
                Apply Commits
              </Button>
              <Button
                icon={<UploadOutlined />}
                onClick={() => pushMutation.mutate(selectedWorkspace)}
                loading={pushMutation.isPending}
              >
                Push
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['commit'] });
                }}
              >
                Refresh
              </Button>
            </Space>
          </KBCard>
        </KBSection>
      )}
    </Space>
  );
}
