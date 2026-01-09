/**
 * @module @kb-labs/studio-app/modules/release/components/steps/plan-step
 * Step 1: Generate and review release plan
 */

import * as React from 'react';
import {
  Button,
  Card,
  Empty,
  Spin,
  Table,
  Typography,
  Space,
  Tag,
  message,
  Checkbox,
  Collapse,
  Timeline,
} from 'antd';
import {
  ThunderboltOutlined,
  CheckCircleOutlined,
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
  useGitTimeline,
} from '@kb-labs/studio-data-client';

const { Text } = Typography;

interface PlanStepProps {
  selectedScope: string;
  onPlanReady: (ready: boolean) => void;
}

const INITIAL_COMMITS_COUNT = 5;

export function PlanStep({ selectedScope, onPlanReady }: PlanStepProps) {
  const sources = useDataSources();
  const [useLLM, setUseLLM] = React.useState(true);
  const [showAllCommits, setShowAllCommits] = React.useState(false);

  // Fetch data
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

  const { data: gitTimelineData } = useGitTimeline(
    sources.release,
    selectedScope,
    !!selectedScope
  );

  const generateMutation = useGenerateReleasePlan(sources.release);

  // Update parent when plan is ready
  React.useEffect(() => {
    const hasPlan = !!(planData?.plan && planData.plan.packages.length > 0);
    onPlanReady(hasPlan);
  }, [planData, onPlanReady]);

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        scope: selectedScope,
        dryRun: false,
        useLLM,
      });

      await Promise.all([refetchStatus(), refetchPlan()]);

      const confidencePercent = result.confidence ? Math.round(result.confidence * 100) : 0;
      const tokensInfo = result.tokensUsed ? `, ${result.tokensUsed} tokens` : '';
      const method = useLLM ? 'AI-powered' : 'Simple';

      message.success(`${method} plan generated (${confidencePercent}% confidence${tokensInfo})`);
    } catch (error) {
      message.error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (statusLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No plan exists - show generate UI
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
            <Text type="secondary" style={{ fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git history and provide intelligent reasoning for version bumps'
                : 'Generate plan using conventional commits analysis'}
            </Text>
          </Space>
        </Empty>
      </Card>
    );
  }

  if (planLoading || !planData?.plan) {
    return <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  const { plan } = planData;

  // Plan exists but no packages - show regenerate prompt
  if (plan.packages.length === 0) {
    return (
      <Card>
        <Empty
          description="Plan exists but contains no packages"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Space direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              This may happen if there are no changes to release or the scope has no packages.
            </Text>
            <Checkbox checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)}>
              Use AI-powered analysis
            </Checkbox>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
            >
              Regenerate Plan
            </Button>
          </Space>
        </Empty>
      </Card>
    );
  }

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
        if (!bump) return '-';
        const colorMap: Record<string, string> = {
          major: 'red',
          minor: 'orange',
          patch: 'blue',
        };
        return <Tag color={colorMap[bump] || 'default'}>{bump}</Tag>;
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
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

  return (
    <Card
      title={
        <Space>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          <span>Release Plan Ready</span>
          <Tag color="blue">{plan.packages.length} package(s)</Tag>
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
            size="small"
          >
            Regenerate
          </Button>
        </Space>
      }
    >
      {/* Git Timeline */}
      {gitTimelineData && gitTimelineData.hasUnreleasedChanges && (
        <Collapse
          size="small"
          style={{ marginBottom: 16 }}
          items={[
            {
              key: 'timeline',
              label: (
                <Space>
                  <BranchesOutlined />
                  <span>Git Timeline</span>
                  <Tag>{gitTimelineData.unreleased} commits</Tag>
                </Space>
              ),
              children: (
                <>
                  {gitTimelineData.suggestedVersion && (
                    <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f6ffed', borderRadius: 4 }}>
                      <Space>
                        <ArrowUpOutlined />
                        <Text strong>
                          {gitTimelineData.currentVersion || '0.0.0'} → {gitTimelineData.suggestedVersion}
                        </Text>
                        <Tag color={
                          gitTimelineData.suggestedBump === 'major' ? 'red' :
                          gitTimelineData.suggestedBump === 'minor' ? 'orange' :
                          'blue'
                        }>
                          {gitTimelineData.suggestedBump}
                        </Tag>
                      </Space>
                    </div>
                  )}

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
                            <Space size="small">
                              <Tag color={
                                commit.type === 'feat' ? 'green' :
                                commit.type === 'fix' ? 'red' :
                                commit.type === 'BREAKING' ? 'volcano' :
                                'default'
                              } style={{ fontSize: 10 }}>
                                {commit.type}
                              </Tag>
                              <Text code style={{ fontSize: 10 }}>{commit.shortSha}</Text>
                            </Space>
                            <div style={{ marginTop: 2 }}>
                              <Text style={{ fontSize: 12 }}>{commit.message}</Text>
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
                        : `Show ${gitTimelineData.commits.length - INITIAL_COMMITS_COUNT} more`}
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
        scroll={{ x: 700 }}
        tableLayout="fixed"
      />
    </Card>
  );
}
