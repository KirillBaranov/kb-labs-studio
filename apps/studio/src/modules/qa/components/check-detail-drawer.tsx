/**
 * @module @kb-labs/studio-app/modules/qa/components/check-detail-drawer
 * Drawer showing per-package details for a specific check type.
 * Opens when a check card is clicked on the overview tab.
 */

import * as React from 'react';
import {
  UIDrawer,
  UITable,
  UITag,
  UIInput,
  UISpace,
  UITypographyText,
  UIButton,
  UIMessage,
  UIAccordion,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQADetails, useQARunCheck } from '@kb-labs/studio-data-client';
import type { QARunCheckOptions } from '@kb-labs/studio-data-client';

interface CheckDetailDrawerProps {
  open: boolean;
  checkType: string | null;
  checkLabel: string;
  onClose: () => void;
}

const STATUS_CONFIG = {
  passed: { color: 'success', icon: <UIIcon name="CheckCircleOutlined" /> },
  failed: { color: 'error', icon: <UIIcon name="CloseCircleOutlined" /> },
  skipped: { color: 'default', icon: <UIIcon name="MinusCircleOutlined" /> },
} as const;

export function CheckDetailDrawer({ open, checkType, checkLabel, onClose }: CheckDetailDrawerProps) {
  const sources = useDataSources();
  const { data: details, isLoading } = useQADetails(sources.qa);
  const { mutate: runCheck, isPending: isRunning } = useQARunCheck(sources.qa);
  const [search, setSearch] = React.useState('');

  if (!checkType) {return null;}

  const checkData = details?.checks[checkType];

  // Combine all packages into a single list
  const allPackages = [
    ...(checkData?.failed ?? []).map((p) => ({ ...p, status: 'failed' as const })),
    ...(checkData?.passed ?? []).map((p) => ({ ...p, status: 'passed' as const })),
    ...(checkData?.skipped ?? []).map((p) => ({ ...p, status: 'skipped' as const })),
  ].filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.repo.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRunCheck = () => {
    const opts: QARunCheckOptions = { checkType: checkType as 'lint' | 'typeCheck' | 'test' };
    const hideLoading = UIMessage.loading(`Running ${checkLabel}...`, 0);
    runCheck(opts, {
      onSuccess: (data) => {
        hideLoading();
        if (data.status === 'passed') {
          UIMessage.success(`${checkLabel} passed in ${(data.durationMs / 1000).toFixed(1)}s`);
        } else {
          UIMessage.warning(`${checkLabel}: ${data.result.failed.length} failures in ${(data.durationMs / 1000).toFixed(1)}s`);
        }
      },
      onError: (error) => {
        hideLoading();
        UIMessage.error(`${checkLabel} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      },
    });
  };

  const canRerun = checkType !== 'build';

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      filters: [
        { text: 'Failed', value: 'failed' },
        { text: 'Passed', value: 'passed' },
        { text: 'Skipped', value: 'skipped' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: keyof typeof STATUS_CONFIG) => {
        const cfg = STATUS_CONFIG[status];
        return <UITag color={cfg.color} icon={cfg.icon}>{status}</UITag>;
      },
    },
    {
      title: 'Package',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <UITypographyText code style={{ fontSize: 12 }}>{name}</UITypographyText>
      ),
    },
    {
      title: 'Repo',
      dataIndex: 'repo',
      key: 'repo',
      width: 180,
      filters: [...new Set(allPackages.map((p) => p.repo))].map((r) => ({ text: r, value: r })),
      onFilter: (value: any, record: any) => record.repo === value,
      render: (repo: string) => <UITag>{repo}</UITag>,
    },
  ];

  // Expandable row for error details
  const expandedRowRender = (record: any) => {
    if (!record.error) {return null;}
    return (
      <UIAccordion
        ghost
        items={[{
          key: '1',
          label: 'Error output',
          children: (
            <pre style={{
              background: '#141414',
              color: '#d4d4d4',
              padding: 12,
              borderRadius: 6,
              fontSize: 11,
              maxHeight: 300,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {record.error}
            </pre>
          ),
        }]}
      />
    );
  };

  return (
    <UIDrawer
      title={
        <UISpace>
          <span>{checkLabel} Details</span>
          <UITag color={checkData?.failed.length ? 'error' : 'success'}>
            {checkData?.failed.length ?? 0} failed
          </UITag>
        </UISpace>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      extra={
        canRerun && (
          <UIButton
            type="primary"
            icon={<UIIcon name="PlayCircleOutlined" />}
            onClick={handleRunCheck}
            loading={isRunning}
            size="small"
          >
            Re-run {checkLabel}
          </UIButton>
        )
      }
    >
      <UIInput
        placeholder="Filter by package or repo..."
        prefix={<UIIcon name="SearchOutlined" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16 }}
        allowClear
      />

      <UITable
        dataSource={allPackages}
        columns={columns}
        rowKey="name"
        size="small"
        loading={isLoading}
        pagination={{ pageSize: 50, showSizeChanger: true }}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => !!record.error,
        }}
      />
    </UIDrawer>
  );
}
