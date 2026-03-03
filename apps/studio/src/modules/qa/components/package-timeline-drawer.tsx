/**
 * @module @kb-labs/studio-app/modules/qa/components/package-timeline-drawer
 * Drawer showing per-package QA history timeline with flaky detection.
 */

import * as React from 'react';
import {
  UIDrawer,
  UITable,
  UITag,
  UITypographyText,
  UIDescriptions,
  UIDescriptionsItem,
  UIStatistic,
  UIRow,
  UICol,
  UISpin,
  UIAlert,
  UISpace,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQAPackageTimeline } from '@kb-labs/studio-data-client';

interface PackageTimelineDrawerProps {
  open: boolean;
  packageName: string | null;
  onClose: () => void;
}

const CHECK_STATUS_TAG = {
  passed: { color: 'success', icon: <UIIcon name="CheckCircleOutlined" /> },
  failed: { color: 'error', icon: <UIIcon name="CloseCircleOutlined" /> },
  skipped: { color: 'default', icon: <UIIcon name="MinusCircleOutlined" /> },
} as const;

export function PackageTimelineDrawer({ open, packageName, onClose }: PackageTimelineDrawerProps) {
  const sources = useDataSources();
  const { data, isLoading } = useQAPackageTimeline(sources.qa, packageName ?? '');

  if (!packageName) {return null;}

  return (
    <UIDrawer
      title={
        <UISpace>
          <span>Timeline: {packageName}</span>
          {data?.flakyScore && data.flakyScore > 0.3 && (
            <UITag color="warning" icon={<UIIcon name="WarningOutlined" />}>Flaky</UITag>
          )}
        </UISpace>
      }
      placement="right"
      width={700}
      open={open}
      onClose={onClose}
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <UISpin size="large" />
        </div>
      )}

      {!isLoading && !data && (
        <UIAlert variant="info" message={`No history found for ${packageName}`} />
      )}

      {!isLoading && data && (
        <div>
          {/* Stats */}
          <UIRow gutter={16} style={{ marginBottom: 24 }}>
            <UICol span={6}>
              <UIStatistic
                title="Repo"
                value={data.repo}
                valueStyle={{ fontSize: 14 }}
              />
            </UICol>
            <UICol span={6}>
              <UIStatistic
                title="Streak"
                value={data.currentStreak.count}
                prefix={data.currentStreak.status === 'failing' ? <UIIcon name="FireOutlined" /> : <UIIcon name="CheckCircleOutlined" />}
                suffix={data.currentStreak.status}
                valueStyle={{
                  fontSize: 14,
                  color: data.currentStreak.status === 'failing' ? '#ff4d4f' : '#52c41a',
                }}
              />
            </UICol>
            <UICol span={6}>
              <UIStatistic
                title="Flaky Score"
                value={Math.round(data.flakyScore * 100)}
                suffix="%"
                valueStyle={{
                  fontSize: 14,
                  color: data.flakyScore > 0.3 ? '#faad14' : '#52c41a',
                }}
              />
            </UICol>
            <UICol span={6}>
              {data.firstFailure && (
                <UIStatistic
                  title="First Failure"
                  value={new Date(data.firstFailure).toLocaleDateString()}
                  valueStyle={{ fontSize: 14 }}
                />
              )}
            </UICol>
          </UIRow>

          {data.flakyChecks.length > 0 && (
            <UIAlert
              variant="warning"
              showIcon
              icon={<UIIcon name="WarningOutlined" />}
              message="Flaky checks detected"
              description={
                <UISpace>
                  {data.flakyChecks.map((ct) => (
                    <UITag key={ct} color="warning">{ct}</UITag>
                  ))}
                </UISpace>
              }
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Timeline table */}
          <UITable
            dataSource={data.entries}
            rowKey="timestamp"
            size="small"
            pagination={{ pageSize: 20 }}
            columns={[
              {
                title: 'Date',
                dataIndex: 'timestamp',
                key: 'timestamp',
                width: 160,
                render: (ts: string) => new Date(ts).toLocaleString(),
              },
              {
                title: 'Commit',
                key: 'git',
                width: 120,
                render: (_: any, record: any) => (
                  <UITypographyText code style={{ fontSize: 11 }}>
                    {record.git.commit.slice(0, 7)}
                  </UITypographyText>
                ),
              },
              {
                title: 'Build',
                key: 'build',
                width: 80,
                render: (_: any, record: any) => {
                  const s = record.checks.build as keyof typeof CHECK_STATUS_TAG;
                  const cfg = CHECK_STATUS_TAG[s];
                  return cfg ? <UITag color={cfg.color} icon={cfg.icon}>{s}</UITag> : <UITag>{s}</UITag>;
                },
              },
              {
                title: 'Lint',
                key: 'lint',
                width: 80,
                render: (_: any, record: any) => {
                  const s = record.checks.lint as keyof typeof CHECK_STATUS_TAG;
                  const cfg = CHECK_STATUS_TAG[s];
                  return cfg ? <UITag color={cfg.color} icon={cfg.icon}>{s}</UITag> : <UITag>{s}</UITag>;
                },
              },
              {
                title: 'Types',
                key: 'typeCheck',
                width: 80,
                render: (_: any, record: any) => {
                  const s = record.checks.typeCheck as keyof typeof CHECK_STATUS_TAG;
                  const cfg = CHECK_STATUS_TAG[s];
                  return cfg ? <UITag color={cfg.color} icon={cfg.icon}>{s}</UITag> : <UITag>{s}</UITag>;
                },
              },
              {
                title: 'Tests',
                key: 'test',
                width: 80,
                render: (_: any, record: any) => {
                  const s = record.checks.test as keyof typeof CHECK_STATUS_TAG;
                  const cfg = CHECK_STATUS_TAG[s];
                  return cfg ? <UITag color={cfg.color} icon={cfg.icon}>{s}</UITag> : <UITag>{s}</UITag>;
                },
              },
            ]}
          />
        </div>
      )}
    </UIDrawer>
  );
}
