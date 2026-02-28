/**
 * @module @kb-labs/studio-app/modules/qa/components/trends-tab
 * Enriched trends tab -- time-series chart, summary cards with velocity, changelog timeline
 */

import * as React from 'react';
import {
  UICard,
  UIRow,
  UICol,
  UITag,
  UIStatistic,
  UISpin,
  UIAlert,
  UISpace,
  UISelect,
  UITimeline,
  UITimelineItem,
  UIEmptyState,
  UIIcon,
  UIStatisticsChart,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQAEnrichedTrends } from '@kb-labs/studio-data-client';
import type { EnrichedTrendResult, TrendChangelogEntry } from '@kb-labs/qa-contracts';

const CHECK_ICONS: Record<string, React.ReactNode> = {
  build: <UIIcon name="BuildOutlined" />,
  lint: <UIIcon name="FileSearchOutlined" />,
  typeCheck: <UIIcon name="FileTextOutlined" />,
  test: <UIIcon name="ExperimentOutlined" />,
};

const CHECK_LABELS: Record<string, string> = {
  build: 'Build',
  lint: 'Lint',
  typeCheck: 'Type Check',
  test: 'Tests',
};

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'regression': return '#ff4d4f';
    case 'improvement': return '#52c41a';
    default: return '#8c8c8c';
  }
}

function getTrendIcon(trend: string): React.ReactNode {
  switch (trend) {
    case 'regression': return <UIIcon name="ArrowUpOutlined" />;
    case 'improvement': return <UIIcon name="ArrowDownOutlined" />;
    default: return <UIIcon name="MinusOutlined" />;
  }
}

function getTrendTag(trend: string): React.ReactNode {
  switch (trend) {
    case 'regression': return <UITag color="error">Regression</UITag>;
    case 'improvement': return <UITag color="success">Improvement</UITag>;
    default: return <UITag>No Change</UITag>;
  }
}

/**
 * Transform enriched trends timeSeries into chart-ready data for UIStatisticsChart.
 * Creates 4 series (one per check type) with date/value/category fields.
 */
function buildChartData(trends: EnrichedTrendResult[]) {
  const rows: Array<{ date: string; value: number; category: string }> = [];

  for (const trend of trends) {
    const label = CHECK_LABELS[trend.checkType] ?? trend.checkType;
    for (const point of trend.timeSeries) {
      rows.push({
        date: point.timestamp.slice(0, 10), // YYYY-MM-DD
        value: point.failed,
        category: label,
      });
    }
  }

  return rows;
}

/**
 * Merge changelogs from all check types into a single timeline, grouped by commit.
 */
function buildMergedChangelog(trends: EnrichedTrendResult[]) {
  const byCommit = new Map<string, {
    timestamp: string;
    gitCommit: string;
    gitMessage: string;
    changes: Array<{ checkType: string; entry: TrendChangelogEntry }>;
  }>();

  for (const trend of trends) {
    for (const entry of trend.changelog) {
      let group = byCommit.get(entry.gitCommit);
      if (!group) {
        group = {
          timestamp: entry.timestamp,
          gitCommit: entry.gitCommit,
          gitMessage: entry.gitMessage,
          changes: [],
        };
        byCommit.set(entry.gitCommit, group);
      }
      group.changes.push({ checkType: trend.checkType, entry });
    }
  }

  // Sort by timestamp descending (newest first)
  return [...byCommit.values()].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function TrendsTab() {
  const sources = useDataSources();
  const [window, setWindow] = React.useState<number | undefined>(undefined);
  const { data, isLoading } = useQAEnrichedTrends(sources.qa, window);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <UISpin size="large" />
      </div>
    );
  }

  if (!data || data.trends.length === 0) {
    return (
      <UIAlert
        type="info"
        showIcon
        message="Not enough data for trend analysis"
        description="Need at least 2 history entries. Run 'pnpm qa:save' multiple times."
      />
    );
  }

  const chartData = buildChartData(data.trends);
  const mergedChangelog = buildMergedChangelog(data.trends);

  return (
    <div>
      {/* Window selector */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#8c8c8c' }}>
          Analyzing {data.historyCount} history entries (window: {data.window})
        </span>
        <UISpace>
          <span>Window size:</span>
          <UISelect
            value={window ?? data.window}
            onChange={(val) => setWindow(val)}
            style={{ width: 80 }}
            options={[
              { label: '5', value: 5 },
              { label: '10', value: 10 },
              { label: '20', value: 20 },
              { label: '50', value: 50 },
            ]}
          />
        </UISpace>
      </div>

      {/* Time-series chart */}
      <UIStatisticsChart
        title="Failure Count Over Time"
        data={chartData}
        loading={false}
        xField="date"
        yField="value"
        colorField="category"
        height={300}
        showLegend={false}
        chartProps={{ legend: { position: 'top' } }}
      />

      {/* Summary Cards */}
      <UIRow gutter={[16, 16]} style={{ marginTop: 16 }}>
        {data.trends.map((trend) => (
          <UICol xs={24} sm={12} key={trend.checkType}>
            <UICard size="small">
              <UIRow align="middle" gutter={16}>
                <UICol flex="auto">
                  <UISpace>
                    {CHECK_ICONS[trend.checkType]}
                    <span style={{ fontWeight: 600, fontSize: 16 }}>
                      {CHECK_LABELS[trend.checkType] ?? trend.checkType}
                    </span>
                    {getTrendTag(trend.trend)}
                  </UISpace>
                </UICol>
              </UIRow>
              <UIRow gutter={16} style={{ marginTop: 12 }}>
                <UICol span={6}>
                  <UIStatistic
                    title="Previous"
                    value={trend.previous}
                    valueStyle={{ fontSize: 18 }}
                  />
                </UICol>
                <UICol span={6}>
                  <UIStatistic
                    title="Current"
                    value={trend.current}
                    valueStyle={{ fontSize: 18 }}
                  />
                </UICol>
                <UICol span={6}>
                  <UIStatistic
                    title="Delta"
                    value={Math.abs(trend.delta)}
                    prefix={getTrendIcon(trend.trend)}
                    valueStyle={{
                      color: getTrendColor(trend.trend),
                      fontSize: 18,
                    }}
                  />
                </UICol>
                <UICol span={6}>
                  <UIStatistic
                    title="Velocity"
                    value={Math.abs(trend.velocity)}
                    precision={1}
                    prefix={trend.velocity > 0 ? <UIIcon name="ArrowUpOutlined" /> : trend.velocity < 0 ? <UIIcon name="ArrowDownOutlined" /> : <UIIcon name="MinusOutlined" />}
                    suffix="/run"
                    valueStyle={{
                      color: trend.velocity > 0 ? '#ff4d4f' : trend.velocity < 0 ? '#52c41a' : '#8c8c8c',
                      fontSize: 18,
                    }}
                  />
                </UICol>
              </UIRow>
            </UICard>
          </UICol>
        ))}
      </UIRow>

      {/* Changelog Timeline */}
      <UICard title="Changelog -- What Changed" style={{ marginTop: 16 }}>
        {mergedChangelog.length === 0 ? (
          <UIEmptyState description="No changes detected between entries" />
        ) : (
          <UITimeline>
            {mergedChangelog.map((group) => {
              // Determine dot color: red if any net regression, green if net improvement
              const totalNewFailures = group.changes.reduce((s, c) => s + c.entry.newFailures.length, 0);
              const totalFixed = group.changes.reduce((s, c) => s + c.entry.fixed.length, 0);
              const dotColor = totalNewFailures > totalFixed ? '#ff4d4f' : '#52c41a';

              return (
                <UITimelineItem key={group.gitCommit} color={dotColor}>
                  <div style={{ marginBottom: 4 }}>
                    <UITag style={{ fontFamily: 'monospace' }}>{group.gitCommit.slice(0, 7)}</UITag>
                    <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                      {new Date(group.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#595959', marginBottom: 8 }}>
                    {group.gitMessage}
                  </div>
                  {group.changes.map(({ checkType, entry }) => (
                    <div key={checkType} style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>
                        {CHECK_LABELS[checkType] ?? checkType}:
                      </span>
                      {entry.newFailures.length > 0 && (
                        <span style={{ marginLeft: 8 }}>
                          <UITag color="error" style={{ fontSize: 11 }}>+{entry.newFailures.length} new</UITag>
                          {entry.newFailures.map((pkg) => (
                            <UITag key={pkg} color="red" style={{ fontSize: 11 }}>{pkg}</UITag>
                          ))}
                        </span>
                      )}
                      {entry.fixed.length > 0 && (
                        <span style={{ marginLeft: 8 }}>
                          <UITag color="success" style={{ fontSize: 11 }}>-{entry.fixed.length} fixed</UITag>
                          {entry.fixed.map((pkg) => (
                            <UITag key={pkg} color="green" style={{ fontSize: 11 }}>{pkg}</UITag>
                          ))}
                        </span>
                      )}
                    </div>
                  ))}
                </UITimelineItem>
              );
            })}
          </UITimeline>
        )}
      </UICard>
    </div>
  );
}
