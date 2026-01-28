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
  Checkbox,
  Collapse,
} from 'antd';
import {
  ThunderboltOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  BranchesOutlined,
  ArrowUpOutlined,
  DownOutlined,
  UpOutlined,
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

const INITIAL_COMMITS_COUNT = 5;

export function PlanTab({ selectedScope }: PlanTabProps) {
  const sources = useDataSources();
  const [useLLM, setUseLLM] = useState(true);
  const [showAllCommits, setShowAllCommits] = useState(false);

  // Fetch status and plan
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useReleaseStatus(
    sources.release,
    selectedScope,
    !!selectedScope
  );

  const { data: planData, isLoading: planLoading, refetch: refetchPlan } = useReleasePlan(
    sources.release,
    selectedScope,
    !!selectedScope
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
        useLLM,
      });

      // Explicitly refetch to ensure UI updates
      await Promise.all([refetchStatus(), refetchPlan()]);

      const confidencePercent = result.confidence ? Math.round(result.confidence * 100) : 0;
      const tokensInfo = result.tokensUsed ? `, ${result.tokensUsed} tokens` : '';
      const method = useLLM ? 'AI-powered' : 'Simple';

      message.success(`${method} plan generated (${confidencePercent}% confidence${tokensInfo})`);
    } catch (error) {
      message.error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleReset = async () => {
    try {
      await resetMutation.mutateAsync({ scope: selectedScope });

      // Explicitly refetch to ensure UI updates
      await Promise.all([refetchStatus(), refetchPlan()]);

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
  if (!statusData?.hasPlan && !planData?.plan) {
    return (
      <Card>
        <Empty
          description="No release plan generated yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)}>
              Use AI-powered analysis (requires LLM)
            </Checkbox>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
              size="large"
            >
              Generate Release Plan
            </Button>
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git history and provide intelligent reasoning for version bumps'
                : 'Generate plan using conventional commits analysis'}
            </div>
          </Space>
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
      width: 280,
      ellipsis: true,
      render: (name: string) => (
        <Text strong ellipsis={{ tooltip: name }}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Current',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 90,
      render: (version: string) => version ? <Tag color="blue">{version}</Tag> : '-',
    },
    {
      title: 'Next',
      dataIndex: 'nextVersion',
      key: 'nextVersion',
      width: 90,
      render: (version: string) => version ? <Tag color="green">{version}</Tag> : '-',
    },
    {
      title: 'Bump',
      dataIndex: 'bump',
      key: 'bump',
      width: 80,
      render: (bump: string) => {
        if (!bump) {return '-';}
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
      width: 100,
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
      width: 260,
      ellipsis: { showTitle: false },
      render: (reason: string) => (
        <Text
          type="secondary"
          ellipsis={{ tooltip: { title: reason, overlayStyle: { maxWidth: 400 } } }}
          style={{ fontSize: 12 }}
        >
          {reason || '-'}
        </Text>
      ),
    },
  ];

  const allPublished = plan.packages.every((pkg) => pkg.isPublished);

  return (
    <Card
      key={plan.createdAt}
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
          <Checkbox
            checked={useLLM}
            onChange={(e) => setUseLLM(e.target.checked)}
            style={{ fontSize: 12 }}
          >
            Use AI
          </Checkbox>
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
      {/* Git Timeline & Version Preview */}
      {gitTimelineData && gitTimelineData.hasUnreleasedChanges && (
        <Collapse
          style={{ marginBottom: 16 }}
          defaultActiveKey={['timeline']}
          items={[
            {
              key: 'timeline',
              label: (
                <Space>
                  <BranchesOutlined />
                  <span>Git Timeline & Version Preview</span>
                  <Tag>{gitTimelineData.unreleased} commits</Tag>
                </Space>
              ),
              children: (
                <>
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
                    items={gitTimelineData.commits
                      .slice(0, showAllCommits ? undefined : INITIAL_COMMITS_COUNT)
                      .map((commit: any) => ({
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

                  {gitTimelineData.commits.length > INITIAL_COMMITS_COUNT && (
                    <Button
                      type="link"
                      size="small"
                      icon={showAllCommits ? <UpOutlined /> : <DownOutlined />}
                      onClick={() => setShowAllCommits(!showAllCommits)}
                      style={{ padding: 0 }}
                    >
                      {showAllCommits
                        ? 'Show less'
                        : `Show ${gitTimelineData.commits.length - INITIAL_COMMITS_COUNT} more commits`}
                    </Button>
                  )}
                </>
              ),
            },
          ]}
        />
      )}

      <Table
        columns={columns}
        dataSource={plan.packages}
        rowKey="name"
        pagination={false}
        size="small"
        scroll={{ x: 800 }}
        tableLayout="fixed"
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
