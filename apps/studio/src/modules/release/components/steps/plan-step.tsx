/**
 * @module @kb-labs/studio-app/modules/release/components/steps/plan-step
 * Step 1: Generate and review release plan
 */

import * as React from 'react';
import {
  UIButton,
  UICard,
  UIEmptyState,
  UISpin,
  UITable,
  UITypographyText,
  UISpace,
  UITag,
  UIMessage,
  UICheckbox,
  UIAccordion,
  UITimeline,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseStatus,
  useReleasePlan,
  useGenerateReleasePlan,
  useGitTimeline,
} from '@kb-labs/studio-data-client';

interface PlanStepProps {
  selectedScope: string;
  selectedScopePath?: string;
  onPlanReady: (ready: boolean) => void;
}

const INITIAL_COMMITS_COUNT = 5;

export function PlanStep({ selectedScope, selectedScopePath, onPlanReady }: PlanStepProps) {
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
        scopePath: selectedScopePath,
        useLLM,
      });

      await Promise.all([refetchStatus(), refetchPlan()]);

      const confidencePercent = result.confidence ? Math.round(result.confidence * 100) : 0;
      const tokensInfo = result.tokensUsed ? `, ${result.tokensUsed} tokens` : '';
      const method = useLLM ? 'AI-powered' : 'Simple';

      UIMessage.success(`${method} plan generated (${confidencePercent}% confidence${tokensInfo})`);
    } catch (error) {
      UIMessage.error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (statusLoading) {
    return <UISpin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  // No plan exists - check if there's anything to release
  if (!statusData?.hasPlan && !planData?.plan) {
    // gitTimeline loaded and explicitly says no unreleased changes
    const noChanges = gitTimelineData !== undefined && !gitTimelineData.hasUnreleasedChanges;

    if (noChanges) {
      return (
        <UICard>
          <UIEmptyState
            description={`No unreleased changes since ${gitTimelineData?.lastTag ?? 'last release'}`}
            image={UIEmptyState.PRESENTED_IMAGE_SIMPLE}
          />
        </UICard>
      );
    }

    return (
      <UICard>
        <UIEmptyState
          description="No release plan generated yet"
          image={UIEmptyState.PRESENTED_IMAGE_SIMPLE}
        >
          <UISpace direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <UICheckbox checked={useLLM} onChange={(checked) => setUseLLM(checked)}>
              Use AI-powered analysis (requires LLM)
            </UICheckbox>
            <UIButton
              variant="primary"
              icon={<UIIcon name="ThunderboltOutlined" />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
              size="large"
            >
              Generate Release Plan
            </UIButton>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              {useLLM
                ? 'AI will analyze git history and provide intelligent reasoning for version bumps'
                : 'Generate plan using conventional commits analysis'}
            </UITypographyText>
          </UISpace>
        </UIEmptyState>
      </UICard>
    );
  }

  if (planLoading || !planData?.plan) {
    return <UISpin size="large" style={{ display: 'block', margin: '48px auto' }} />;
  }

  const { plan } = planData;

  // Plan exists but no packages - show regenerate prompt
  if (plan.packages.length === 0) {
    return (
      <UICard>
        <UIEmptyState
          description="Plan exists but contains no packages"
          image={UIEmptyState.PRESENTED_IMAGE_SIMPLE}
        >
          <UISpace direction="vertical" size="middle" style={{ display: 'flex', alignItems: 'center' }}>
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>
              This may happen if there are no changes to release or the scope has no packages.
            </UITypographyText>
            <UICheckbox checked={useLLM} onChange={(checked) => setUseLLM(checked)}>
              Use AI-powered analysis
            </UICheckbox>
            <UIButton
              variant="primary"
              icon={<UIIcon name="ThunderboltOutlined" />}
              onClick={handleGenerate}
              loading={generateMutation.isPending}
            >
              Regenerate Plan
            </UIButton>
          </UISpace>
        </UIEmptyState>
      </UICard>
    );
  }

  const columns: import('@kb-labs/studio-ui-kit').UITableColumn<{ name: string; path: string; currentVersion: string; nextVersion: string; bump: 'auto' | 'patch' | 'major' | 'minor'; isPublished: boolean; dependencies?: string[]; reason?: string }>[] = [
    {
      title: 'Package',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      ellipsis: true,
      render: (name: string) => (
        <UITypographyText strong ellipsis={{ tooltip: name }}>
          {name}
        </UITypographyText>
      ),
    },
    {
      title: 'Current',
      dataIndex: 'currentVersion',
      key: 'currentVersion',
      width: 90,
      render: (version: string) => version ? <UITag color="blue">{version}</UITag> : '-',
    },
    {
      title: 'Next',
      dataIndex: 'nextVersion',
      key: 'nextVersion',
      width: 90,
      render: (version: string) => version ? <UITag color="green">{version}</UITag> : '-',
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
        return <UITag color={colorMap[bump] || 'default'}>{bump}</UITag>;
      },
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => (
        <UITypographyText
          type="secondary"
          style={{ fontSize: 12 }}
        >
          {reason || '-'}
        </UITypographyText>
      ),
    },
  ];

  return (
    <UICard
      title={
        <UISpace>
          <UIIcon name="CheckCircleOutlined" style={{ color: '#52c41a' }} />
          <span>Release Plan Ready</span>
          <UITag color="blue">{plan.packages.length} package(s)</UITag>
        </UISpace>
      }
      extra={
        <UISpace>
          <UICheckbox
            checked={useLLM}
            onChange={(checked) => setUseLLM(checked)}
          >
            Use AI
          </UICheckbox>
          <UIButton
            icon={<UIIcon name="ThunderboltOutlined" />}
            onClick={handleGenerate}
            loading={generateMutation.isPending}
            size="small"
          >
            Regenerate
          </UIButton>
        </UISpace>
      }
    >
      {/* Git Timeline */}
      {gitTimelineData && gitTimelineData.hasUnreleasedChanges && (
        <UIAccordion
          size="small"
          style={{ marginBottom: 16 }}
          defaultActiveKey={['timeline']}
          items={[
            {
              key: 'timeline',
              label: 'Git Timeline',
              extra: (
                <UISpace>
                  <UITag>{gitTimelineData.unreleased} commits</UITag>
                </UISpace>
              ),
              children: (
                <>
                  {gitTimelineData.suggestedVersion && (
                    <div style={{ marginBottom: 16, padding: '8px 12px', background: '#f6ffed', borderRadius: 4 }}>
                      <UISpace>
                        <UIIcon name="ArrowUpOutlined" />
                        <UITypographyText strong>
                          {gitTimelineData.currentVersion || '0.0.0'} → {gitTimelineData.suggestedVersion}
                        </UITypographyText>
                        <UITag color={
                          gitTimelineData.suggestedBump === 'major' ? 'red' :
                          gitTimelineData.suggestedBump === 'minor' ? 'orange' :
                          'blue'
                        }>
                          {gitTimelineData.suggestedBump}
                        </UITag>
                      </UISpace>
                    </div>
                  )}

                  <UITimeline
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
                            <UISpace size="small">
                              <UITag color={
                                commit.type === 'feat' ? 'green' :
                                commit.type === 'fix' ? 'red' :
                                commit.type === 'BREAKING' ? 'volcano' :
                                'default'
                              } style={{ fontSize: 10 }}>
                                {commit.type}
                              </UITag>
                              <UITypographyText code style={{ fontSize: 10 }}>{commit.shortSha}</UITypographyText>
                            </UISpace>
                            <div style={{ marginTop: 2 }}>
                              <UITypographyText style={{ fontSize: 12 }}>{commit.message}</UITypographyText>
                            </div>
                          </div>
                        ),
                      }))}
                  />

                  {gitTimelineData.commits.length > INITIAL_COMMITS_COUNT && (
                    <UIButton
                      variant="link"
                      size="small"
                      icon={showAllCommits ? <UIIcon name="UpOutlined" /> : <UIIcon name="DownOutlined" />}
                      onClick={() => setShowAllCommits(!showAllCommits)}
                      style={{ padding: 0 }}
                    >
                      {showAllCommits
                        ? 'Show less'
                        : `Show ${gitTimelineData.commits.length - INITIAL_COMMITS_COUNT} more`}
                    </UIButton>
                  )}
                </>
              ),
            },
          ]}
        />
      )}

      <UITable
        columns={columns}
        dataSource={plan.packages}
        rowKey="name"
        pagination={false}
        size="small"
      />
    </UICard>
  );
}
