/**
 * @module @kb-labs/studio-app/modules/qa/components/overview-tab
 * Overview tab - per-check pass rates, status badge, baseline diff, error groups.
 * Check cards are clickable -- opens a drawer with per-package details.
 */

import * as React from 'react';
import {
  UIRow,
  UICol,
  UICard,
  UIStatistic,
  UIProgress,
  UITag,
  UIAlert,
  UISpin,
  UISpace,
  UIButton,
  UIMessage,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQASummary, useQARun } from '@kb-labs/studio-data-client';
import { CheckDetailDrawer } from './check-detail-drawer';
import { BaselineDiffCard } from './baseline-diff-card';
import { ErrorGroupsPanel } from './error-groups-panel';

const CHECK_ICONS: Record<string, React.ReactNode> = {
  build: <UIIcon name="BuildOutlined" />,
  lint: <UIIcon name="FileSearchOutlined" />,
  typeCheck: <UIIcon name="FileTextOutlined" />,
  test: <UIIcon name="ExperimentOutlined" />,
};

function getPassRate(passed: number, total: number): number {
  if (total === 0) {return 100;}
  return Math.round((passed / total) * 100);
}

function getProgressStatus(rate: number): 'success' | 'exception' | 'normal' {
  if (rate >= 100) {return 'success';}
  if (rate < 50) {return 'exception';}
  return 'normal';
}

function getProgressColor(rate: number): string {
  if (rate >= 100) {return '#52c41a';}
  if (rate >= 80) {return '#73d13d';}
  if (rate >= 60) {return '#faad14';}
  return '#ff4d4f';
}

export function OverviewTab() {
  const sources = useDataSources();
  const { data: summary, isLoading: summaryLoading } = useQASummary(sources.qa);
  const { mutate: runQA, isPending: isRunning } = useQARun(sources.qa);

  // Drawer state for check details
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedCheck, setSelectedCheck] = React.useState<{ type: string; label: string } | null>(null);

  const handleCheckClick = (checkType: string, label: string) => {
    setSelectedCheck({ type: checkType, label });
    setDrawerOpen(true);
  };

  const handleRunQA = () => {
    const hideLoading = UIMessage.loading('Running QA checks...', 0);
    runQA(undefined, {
      onSuccess: (data) => {
        hideLoading();
        if (data.status === 'passed') {
          UIMessage.success(`QA passed in ${(data.durationMs / 1000).toFixed(1)}s`);
        } else {
          const totalFailed = Object.values(data.results).reduce((sum, r) => sum + r.failed.length, 0);
          UIMessage.warning(`QA finished with ${totalFailed} failures in ${(data.durationMs / 1000).toFixed(1)}s`);
        }
      },
      onError: (error) => {
        hideLoading();
        UIMessage.error(`QA run failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      },
    });
  };

  if (summaryLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <UISpin size="large" />
      </div>
    );
  }

  if (!summary) {
    return (
      <UIAlert
        type="info"
        showIcon
        message="No QA data"
        description="Run 'pnpm qa:save' to generate QA history."
        style={{ marginBottom: 24 }}
      />
    );
  }

  const overallPassed = summary.status === 'passed';

  return (
    <div>
      {/* Run QA Button */}
      <div style={{ marginBottom: 16 }}>
        <UIButton
          type="primary"
          icon={<UIIcon name="PlayCircleOutlined" />}
          onClick={handleRunQA}
          loading={isRunning}
          disabled={isRunning}
          size="large"
        >
          {isRunning ? 'Running QA Checks...' : 'Run QA'}
        </UIButton>
      </div>

      {/* Status Banner */}
      <UIAlert
        type={overallPassed ? 'success' : 'error'}
        showIcon
        icon={overallPassed ? <UIIcon name="CheckCircleOutlined" /> : <UIIcon name="CloseCircleOutlined" />}
        message={
          <UISpace>
            <span style={{ fontWeight: 600 }}>
              QA Status: {overallPassed ? 'All Checks Passing' : 'Checks Failing'}
            </span>
            <UITag color={overallPassed ? 'success' : 'error'}>
              {summary.status.toUpperCase()}
            </UITag>
          </UISpace>
        }
        description={
          summary.lastRunAt ? (
            <UISpace split={<span style={{ color: '#d9d9d9' }}>|</span>}>
              <span>
                <UIIcon name="ClockCircleOutlined" /> {new Date(summary.lastRunAt).toLocaleString()}
              </span>
              {summary.git && (
                <span>
                  <UIIcon name="BranchesOutlined" /> {summary.git.branch} ({summary.git.commit.slice(0, 7)})
                </span>
              )}
              <span>{summary.historyCount} runs in history</span>
            </UISpace>
          ) : undefined
        }
        style={{ marginBottom: 24 }}
      />

      {/* Check Cards -- clickable for drill-down */}
      <UIRow gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summary.checks.map((check) => {
          const rate = getPassRate(check.passed, check.total);
          return (
            <UICol xs={24} sm={12} lg={6} key={check.checkType}>
              <UICard
                hoverable
                onClick={() => handleCheckClick(check.checkType, check.label)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <UIProgress
                    type="circle"
                    percent={rate}
                    size={120}
                    status={getProgressStatus(rate)}
                    strokeColor={getProgressColor(rate)}
                    format={() => `${rate}%`}
                  />
                </div>
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <UISpace>
                    {CHECK_ICONS[check.checkType]}
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{check.label}</span>
                  </UISpace>
                </div>
                <UIRow gutter={8} justify="center">
                  <UICol>
                    <UIStatistic
                      title="Passed"
                      value={check.passed}
                      valueStyle={{ color: '#52c41a', fontSize: 14 }}
                    />
                  </UICol>
                  <UICol>
                    <UIStatistic
                      title="Failed"
                      value={check.failed}
                      valueStyle={{ color: check.failed > 0 ? '#ff4d4f' : '#52c41a', fontSize: 14 }}
                    />
                  </UICol>
                  {check.skipped > 0 && (
                    <UICol>
                      <UIStatistic
                        title="Skipped"
                        value={check.skipped}
                        valueStyle={{ color: '#8c8c8c', fontSize: 14 }}
                      />
                    </UICol>
                  )}
                </UIRow>
              </UICard>
            </UICol>
          );
        })}
      </UIRow>

      {/* Baseline Diff */}
      <div style={{ marginBottom: 24 }}>
        <BaselineDiffCard />
      </div>

      {/* Error Groups */}
      <div style={{ marginBottom: 24 }}>
        <ErrorGroupsPanel />
      </div>

      {/* Check Detail Drawer */}
      <CheckDetailDrawer
        open={drawerOpen}
        checkType={selectedCheck?.type ?? null}
        checkLabel={selectedCheck?.label ?? ''}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
