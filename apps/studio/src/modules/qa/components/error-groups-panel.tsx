/**
 * @module @kb-labs/studio-app/modules/qa/components/error-groups-panel
 * Panel showing errors grouped by pattern (ESLint rules, TS codes, etc.)
 * Helps identify the most impactful errors to fix first.
 */

import * as React from 'react';
import {
  UICard,
  UITable,
  UITag,
  UITypographyText,
  UISpace,
  UIBadge,
  UISpin,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQAErrorGroups } from '@kb-labs/studio-data-client';

const CHECK_TYPE_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  build: { color: 'red', icon: <UIIcon name="BugOutlined" />, label: 'Build' },
  lint: { color: 'orange', icon: <UIIcon name="FileSearchOutlined" />, label: 'Lint' },
  typeCheck: { color: 'blue', icon: <UIIcon name="FileTextOutlined" />, label: 'Types' },
  test: { color: 'purple', icon: <UIIcon name="ExperimentOutlined" />, label: 'Tests' },
};

export function ErrorGroupsPanel() {
  const sources = useDataSources();
  const { data, isLoading } = useQAErrorGroups(sources.qa);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <UISpin />
      </div>
    );
  }

  if (!data || (data.groups.length === 0 && data.ungrouped === 0)) {
    return null;
  }

  const columns = [
    {
      title: 'Pattern',
      dataIndex: 'pattern',
      key: 'pattern',
      render: (pattern: string) => (
        <UITypographyText code style={{ fontSize: 12 }}>{pattern}</UITypographyText>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'checkType',
      key: 'checkType',
      width: 100,
      filters: Object.entries(CHECK_TYPE_CONFIG).map(([key, cfg]) => ({
        text: cfg.label,
        value: key,
      })),
      onFilter: (value: any, record: any) => record.checkType === value,
      render: (ct: string) => {
        const cfg = CHECK_TYPE_CONFIG[ct];
        return cfg ? (
          <UITag color={cfg.color} icon={cfg.icon}>{cfg.label}</UITag>
        ) : (
          <UITag>{ct}</UITag>
        );
      },
    },
    {
      title: 'Affected',
      dataIndex: 'count',
      key: 'count',
      width: 100,
      sorter: (a: any, b: any) => a.count - b.count,
      defaultSortOrder: 'descend' as const,
      render: (count: number) => (
        <UIBadge count={count} style={{ backgroundColor: count > 5 ? '#ff4d4f' : count > 2 ? '#faad14' : '#52c41a' }} />
      ),
    },
    {
      title: 'Packages',
      dataIndex: 'packages',
      key: 'packages',
      render: (packages: string[]) => (
        <UISpace wrap size={[4, 4]}>
          {packages.slice(0, 3).map((pkg) => (
            <UITag key={pkg} style={{ fontSize: 11 }}>{pkg}</UITag>
          ))}
          {packages.length > 3 && (
            <UITypographyText type="secondary" style={{ fontSize: 11 }}>
              +{packages.length - 3} more
            </UITypographyText>
          )}
        </UISpace>
      ),
    },
  ];

  const expandedRowRender = (record: any) => (
    <div>
      <UITypographyText type="secondary" style={{ fontSize: 12 }}>Example:</UITypographyText>
      <pre style={{
        background: '#141414',
        color: '#d4d4d4',
        padding: 8,
        borderRadius: 4,
        fontSize: 11,
        maxHeight: 150,
        overflow: 'auto',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        marginTop: 4,
      }}>
        {record.example}
      </pre>
      {record.packages.length > 3 && (
        <div style={{ marginTop: 8 }}>
          <UITypographyText type="secondary" style={{ fontSize: 12 }}>All affected packages:</UITypographyText>
          <div style={{ marginTop: 4 }}>
            <UISpace wrap size={[4, 4]}>
              {record.packages.map((pkg: string) => (
                <UITag key={pkg} style={{ fontSize: 11 }}>{pkg}</UITag>
              ))}
            </UISpace>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <UICard
      title={
        <UISpace>
          <UIIcon name="BugOutlined" />
          <span>Error Groups</span>
          <UITag>{data.groups.length} patterns</UITag>
          {data.ungrouped > 0 && (
            <UITag color="default">{data.ungrouped} unique errors</UITag>
          )}
        </UISpace>
      }
    >
      <UITable
        dataSource={data.groups}
        columns={columns}
        rowKey="pattern"
        size="small"
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender,
          rowExpandable: () => true,
        }}
      />
    </UICard>
  );
}
