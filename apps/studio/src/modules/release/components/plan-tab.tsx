/**
 * @module @kb-labs/studio-app/modules/release/components/plan-tab
 * Plan Tab - View and generate release plans for selected scope
 */

import { useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Alert,
  Spin,
  Table,
  Typography,
  Space,
  Tag,
  message,
  Popconfirm,
  Timeline,
  Descriptions,
} from 'antd';
import {
  ThunderboltOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BranchesOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseStatus,
  useReleasePlan,
  useGenerateReleasePlan,
  useResetReleasePlan,
  useRunRelease,
  useGitTimeline,
} from '@kb-labs/studio-data-client';
import type { PackageVersion } from '@kb-labs/release-manager-contracts';

const { Title, Text } = Typography;

interface PlanTabProps {
  selectedScope: string;
}

export function PlanTab({ selectedScope }: PlanTabProps) {
  const sources = useDataSources();

  // Fetch status and plan
  const { data: statusData, isLoading: statusLoading } = useReleaseStatus(
    sources.release,
    selectedScope,
    !!selectedScope
  );

  const { data: planData, isLoading: planLoading } = useReleasePlan(
    sources.release,
    selectedScope,
    !!selectedScope && !!statusData?.hasPlan
  );

  const { data: gitTimelineData, isLoading: gitTimelineLoading } = useGitTimeline(
    sources.release,
    selectedScope,
    !!selectedScope
  );

  // Mutations
  const generateMutation = useGenerateReleasePlan(sources.release);
  const resetMutation = useResetReleasePlan(sources.release);
  const runReleaseMutation = useRunRelease(sources.release);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        scope: selectedScope,
        dryRun: false,
      });
      message.success(`Plan generated (${result.confidence * 100}% confidence, ${result.tokensUsed} tokens)`);
    } catch (error) {
      message.error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync({ scope: selectedScope });
      message.success('Plan reset successfully');
    } catch (error) {
      message.error(`Failed to reset plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRunRelease = async () => {
    try {
      const result = await runReleaseMutation.mutateAsync({
        scope: selectedScope,
        dryRun: false,
      });
      message.success(`Release completed! ${result.packagesReleased} package(s) released in ${result.duration}ms`);
    } catch (error) {
      message.error(`Failed to run release: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (!selectedScope) {
    return <Empty description="Please select a scope to continue" style={{ marginTop: 48 }} />;
  }

  if (statusLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No plan exists
  if (!statusData?.hasPlan) {
    return (
      <Card>
        <Empty
          description="No release plan generated yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            size="large"
          >
            Generate Release Plan
          </Button>
          <div style={{ marginTop: 12, color: '#8c8c8c', fontSize: 12 }}>
            AI will analyze git history and determine version bumps
          </div>
        </Empty>
      </Card>
    );
  }

  if (planLoading || !planData?.plan) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  const { plan } = planData;
  const columns = [
    {
      title: 'Package',
      dataIndex: 'name',
      key: 'name',
      width: '40%',
    },
    {
      title: 'Current',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: '15%',
      render: (version: string) => <Tag color="blue">{version}</Tag>,
    },
    {
      title: 'Next',
      dataIndex: 'nextVersion',
      key: 'nextVersion',
      width: '15%',
      render: (version: string) => <Tag color="green">{version}</Tag>,
    },
    {
      title: 'Bump',
      dataIndex: 'bump',
      key: 'bump',
      width: '10%',
      render: (bump: string) => {
        const colorMap: Record<string, string> = {
          major: 'red',
          minor: 'orange',
          patch: 'blue',
        };
        return <Tag color={colorMap[bump] || 'default'}>{bump}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: '10%',
      render: (published: boolean) =>
        published ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Published
          </Tag>
        ) : (
          <Tag color="default">Pending</Tag>
        ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  const allPublished = plan.packages.every((pkg) => pkg.isPublished);

  return (
    <Card
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            Release Plan
          </Title>
          <Tag color="blue">{plan.strategy}</Tag>
          {plan.rollbackEnabled && <Tag color="green">Rollback Enabled</Tag>}
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={handleGenerate}
            loading={generateMutation.isPending}
          >
            Regenerate
          </Button>
          <Popconfirm
            title="Reset Release Plan"
            description="This will delete the current plan. Continue?"
            onConfirm={handleReset}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} loading={resetMutation.isPending} danger>
              Reset
            </Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<RocketOutlined />}
            onClick={handleRunRelease}
            loading={runReleaseMutation.isPending}
            disabled={allPublished}
          >
            Run Release
          </Button>
        </Space>
      }
    >
      <Alert
        message={`${plan.packages.length} package(s) ready for release`}
        description={`Scope: ${plan.scope} · Strategy: ${plan.strategy}`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Git Timeline & Version Preview */}
      {gitTimelineData && gitTimelineData.hasUnreleasedChanges && (
        <Card
          title={
            <Space>
              <BranchesOutlined />
              <span>Git Timeline & Version Preview</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
          size="small"
        >
          {/* Version Preview */}
          {gitTimelineData.suggestedVersion && (
            <Alert
              message={
                <Space>
                  <ArrowUpOutlined />
                  <Text strong>
                    Version {gitTimelineData.currentVersion || '0.0.0'} → {gitTimelineData.suggestedVersion}
                  </Text>
                  <Tag color={
                    gitTimelineData.suggestedBump === 'major' ? 'red' :
                    gitTimelineData.suggestedBump === 'minor' ? 'orange' :
                    'blue'
                  }>
                    {gitTimelineData.suggestedBump}
                  </Tag>
                </Space>
              }
              description={`Based on ${gitTimelineData.unreleased} unreleased commit(s) since ${gitTimelineData.lastTag || 'initial commit'}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Commit Timeline */}
          <Timeline
            mode="left"
            items={gitTimelineData.commits.slice(0, 10).map((commit: any) => ({
              color:
                commit.type === 'feat' ? 'green' :
                commit.type === 'fix' ? 'red' :
                commit.type === 'BREAKING' ? 'volcano' :
                'gray',
              children: (
                <div>
                  <Space>
                    <Tag color={
                      commit.type === 'feat' ? 'green' :
                      commit.type === 'fix' ? 'red' :
                      commit.type === 'BREAKING' ? 'volcano' :
                      'default'
                    }>
                      {commit.type}
                    </Tag>
                    <Tag color={
                      commit.bump === 'major' ? 'red' :
                      commit.bump === 'minor' ? 'orange' :
                      commit.bump === 'patch' ? 'blue' :
                      'default'
                    }>
                      {commit.bump}
                    </Tag>
                    <Text code style={{ fontSize: 11 }}>{commit.shortSha}</Text>
                  </Space>
                  <div style={{ marginTop: 4 }}>
                    <Text>{commit.message}</Text>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: '#8c8c8c' }}>
                    {commit.author} • {new Date(commit.date).toLocaleString()}
                  </div>
                </div>
              ),
            }))}
          />

          {gitTimelineData.commits.length > 10 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ... and {gitTimelineData.commits.length - 10} more commits
            </Text>
          )}
        </Card>
      )}

      <Table
        columns={columns}
        dataSource={plan.packages}
        rowKey="name"
        pagination={false}
        size="small"
      />

      {allPublished && (
        <Alert
          message="All packages have been published"
          description="This release plan has been fully executed."
          type="success"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Card>
  );
}
