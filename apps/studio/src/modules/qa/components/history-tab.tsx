/**
 * @module @kb-labs/studio-app/modules/qa/components/history-tab
 * History tab - table of past QA runs with expandable failure details
 */

import * as React from 'react';
import { UITable, UITag, UISpin, UIAlert, UISpace, UIIcon } from '@kb-labs/studio-ui-kit';
import type { UITableColumn } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQAHistory } from '@kb-labs/studio-data-client';
import type { HistoryEntry } from '@kb-labs/qa-contracts';

const CHECK_LABELS: Record<string, string> = {
  build: 'Build',
  lint: 'Lint',
  typeCheck: 'Types',
  test: 'Tests',
};

function renderCheckColumn(entry: HistoryEntry, checkType: string) {
  const s = entry.summary[checkType as keyof typeof entry.summary];
  if (!s) {return '-';}
  const hasFailed = s.failed > 0;
  return (
    <UITag color={hasFailed ? 'error' : 'success'} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {s.passed}/{s.passed + s.failed}
    </UITag>
  );
}

export function HistoryTab() {
  const sources = useDataSources();
  const { data, isLoading } = useQAHistory(sources.qa);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <UISpin size="large" />
      </div>
    );
  }

  if (!data || data.entries.length === 0) {
    return (
      <UIAlert
        variant="info"
        showIcon
        message="No QA history"
        description="Run 'pnpm qa:save' to record QA results to history."
      />
    );
  }

  const columns: UITableColumn<HistoryEntry>[] = [
    {
      title: 'Date',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts: string) => new Date(ts).toLocaleString(),
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <UITag
          color={status === 'passed' ? 'success' : 'error'}
          icon={status === 'passed' ? <UIIcon name="CheckCircleOutlined" /> : <UIIcon name="CloseCircleOutlined" />}
        >
          {status.toUpperCase()}
        </UITag>
      ),
      filters: [
        { text: 'Passed', value: 'passed' },
        { text: 'Failed', value: 'failed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Git',
      key: 'git',
      width: 220,
      render: (_, record) => (
        <UISpace direction="vertical" size={0}>
          <span>
            <UIIcon name="BranchesOutlined" /> {record.git.branch}
          </span>
          <span style={{ color: '#8c8c8c', fontSize: 12 }}>
            {record.git.commit.slice(0, 7)} - {record.git.message.slice(0, 40)}
            {record.git.message.length > 40 ? '...' : ''}
          </span>
        </UISpace>
      ),
    },
    ...(['build', 'lint', 'typeCheck', 'test'] as const).map((ct) => ({
      title: CHECK_LABELS[ct] ?? ct,
      key: ct,
      width: 90,
      align: 'center' as const,
      render: (_: unknown, record: HistoryEntry) => renderCheckColumn(record, ct),
    })),
  ];

  return (
    <UITable<HistoryEntry>
      columns={columns}
      dataSource={data.entries}
      rowKey="timestamp"
      pagination={{ pageSize: 15 }}
      size="middle"
      expandable={{
        expandedRowRender: (record) => (
          <div style={{ padding: '8px 16px' }}>
            {(['build', 'lint', 'typeCheck', 'test'] as const).map((ct) => {
              const failed = record.failedPackages[ct];
              if (!failed || failed.length === 0) {return null;}
              return (
                <div key={ct} style={{ marginBottom: 12 }}>
                  <strong>{CHECK_LABELS[ct]} failures ({failed.length}):</strong>
                  <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {failed.map((pkg) => (
                      <UITag key={pkg} color="error" style={{ fontSize: 11 }}>
                        {pkg}
                      </UITag>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ),
        rowExpandable: (record) =>
          Object.values(record.failedPackages).some((arr) => arr.length > 0),
      }}
    />
  );
}
