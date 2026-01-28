/**
 * @module @kb-labs/studio-app/modules/commit/components/files-tab
 * Files tab - changed files viewer
 *
 * TODO: TEMPORARY - Remove after commit plugin UI is polished
 */

import { useState, useEffect } from 'react';
import { Select, Table, Tag, Empty } from 'antd';
import { KBSection, KBCard, KBSkeleton } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQuery } from '@tanstack/react-query';

export function FilesTab() {
  const sources = useDataSources();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');

  // Fetch workspaces
  const { data: workspacesData, isLoading: workspacesLoading } = useQuery({
    queryKey: ['commit', 'workspaces'],
    queryFn: () => sources.commit.getWorkspaces(),
  });

  // Fetch git status for selected workspace
  const { data: gitStatusData, isLoading: gitStatusLoading } = useQuery({
    queryKey: ['commit', 'git-status', selectedWorkspace],
    queryFn: () => sources.commit.getGitStatus(selectedWorkspace),
    enabled: !!selectedWorkspace,
  });

  // Auto-select first workspace
  useEffect(() => {
    if (workspacesData?.workspaces && workspacesData.workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspacesData.workspaces[0].id);
    }
  }, [workspacesData, selectedWorkspace]);

  if (workspacesLoading) {
    return <KBSkeleton />;
  }

  const columns = [
    {
      title: 'File',
      dataIndex: 'path',
      key: 'path',
      width: '60%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const colors: Record<string, string> = {
          modified: 'orange',
          added: 'green',
          deleted: 'red',
          renamed: 'blue',
          untracked: 'default',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Changes',
      key: 'changes',
      width: 120,
      render: (record: any) => {
        if (!record.additions && !record.deletions) {return '-';}
        return (
          <span>
            <span style={{ color: 'green' }}>+{record.additions || 0}</span>
            {' / '}
            <span style={{ color: 'red' }}>-{record.deletions || 0}</span>
          </span>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <KBSection>
        <KBCard>
          <label>Select Workspace</label>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Choose monorepo package or repository"
            value={selectedWorkspace}
            onChange={setSelectedWorkspace}
            loading={workspacesLoading}
            showSearch
            options={workspacesData?.workspaces?.map((w: any) => ({
              label: w.name,
              value: w.id,
              title: w.path,
            })) || []}
          />
        </KBCard>
      </KBSection>

      {selectedWorkspace && (
        <KBSection style={{ marginTop: 16 }}>
          <KBCard title="Changed Files">
            {gitStatusLoading ? (
              <KBSkeleton />
            ) : !gitStatusData?.files || gitStatusData.files.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No files changed"
              />
            ) : (
              <Table
                columns={columns}
                dataSource={gitStatusData.files}
                rowKey="path"
                pagination={false}
                size="small"
              />
            )}
          </KBCard>
        </KBSection>
      )}
    </div>
  );
}
