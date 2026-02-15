/**
 * @module @kb-labs/studio-app/modules/commit/components/files-tab-new
 * Files tab - file viewer grouped by status with expandable diffs
 */

import { useState } from 'react';
import { Card, Empty, Skeleton, Tag, Collapse, Typography, Button, Alert, message, Badge } from 'antd';
import {
  FileOutlined,
  RobotOutlined,
  CopyOutlined,
  RightOutlined,
  CheckCircleOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQuery } from '@tanstack/react-query';
import { KBDiffViewer } from '@kb-labs/studio-ui-react';
import { useGitStatus, useSummarizeChanges } from '@kb-labs/studio-data-client';

const { Text } = Typography;

interface FilesTabNewProps {
  selectedScope: string;
}

interface FileEntry {
  path: string;
  status: string;
}

interface StatusGroup {
  key: string;
  label: string;
  color: string;
  tagColor: string;
  icon: React.ReactNode;
  files: FileEntry[];
}

function FileDiffViewer({ scope, file }: { scope: string; file: string }) {
  const sources = useDataSources();

  const { data: diffData, isLoading } = useQuery({
    queryKey: ['commit', 'diff', scope, file],
    queryFn: () => sources.commit.getFileDiff(file, scope),
    enabled: !!scope && !!file,
  });

  if (isLoading) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!diffData || !diffData.diff) {
    return (
      <div style={{ padding: 16 }}>
        <Text type="secondary">No changes to display</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <KBDiffViewer diff={diffData.diff} maxHeight={700} />
    </div>
  );
}

export function FilesTabNew({ selectedScope }: FilesTabNewProps) {
  const sources = useDataSources();
  const [expandedFiles, setExpandedFiles] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const [fileSummaries, setFileSummaries] = useState<Record<string, string>>({});
  const [summarizingFile, setSummarizingFile] = useState<string | null>(null);
  const [isSummarizingAll, setIsSummarizingAll] = useState(false);

  const { data: gitStatusData, isLoading: gitStatusLoading } = useGitStatus(sources.commit, selectedScope, !!selectedScope);
  const summarizeMutation = useSummarizeChanges(sources.commit);

  const handleSummarizeAll = async () => {
    setIsSummarizingAll(true);
    try {
      const result = await summarizeMutation.mutateAsync({ scope: selectedScope });
      setOverallSummary(result.summary);
      message.success('Summary generated');
    } catch {
      message.error('Failed to generate summary');
    } finally {
      setIsSummarizingAll(false);
    }
  };

  const handleSummarizeFile = async (file: string) => {
    setSummarizingFile(file);
    try {
      const result = await summarizeMutation.mutateAsync({ scope: selectedScope, file });
      setFileSummaries(prev => ({ ...prev, [file]: result.summary }));
    } catch {
      message.error(`Failed to summarize ${file}`);
    } finally {
      setSummarizingFile(null);
    }
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleFile = (path: string) => {
    setExpandedFiles(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  // Guards
  if (!selectedScope) {
    return <Empty description="Select a scope to continue" style={{ marginTop: 48 }} />;
  }

  if (gitStatusLoading) {
    return <Card><Skeleton active paragraph={{ rows: 5 }} /></Card>;
  }

  const files: FileEntry[] = (gitStatusData?.rows || []) as FileEntry[];

  if (files.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '48px 0' }}>
        <FileOutlined style={{ fontSize: 48, color: '#8c8c8c', display: 'block', marginBottom: 16 }} />
        <Text type="secondary">No files changed</Text>
      </Card>
    );
  }

  // Group files by status
  const grouped: Record<string, FileEntry[]> = {};
  for (const file of files) {
    const status = file.status || 'modified';
    if (!grouped[status]) grouped[status] = [];
    grouped[status]!.push(file);
  }

  const groups: StatusGroup[] = [
    {
      key: 'staged',
      label: 'Staged',
      color: '#3fb950',
      tagColor: 'green',
      icon: <CheckCircleOutlined style={{ color: '#3fb950' }} />,
      files: grouped['staged'] || [],
    },
    {
      key: 'modified',
      label: 'Modified',
      color: '#d29922',
      tagColor: 'orange',
      icon: <EditOutlined style={{ color: '#d29922' }} />,
      files: grouped['modified'] || [],
    },
    {
      key: 'untracked',
      label: 'Untracked',
      color: '#8b949e',
      tagColor: 'default',
      icon: <PlusOutlined style={{ color: '#8b949e' }} />,
      files: grouped['untracked'] || [],
    },
  ].filter(g => g.files.length > 0);

  return (
    <div>
      {/* Summary bar */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Text type="secondary">
              {files.length} {files.length === 1 ? 'file' : 'files'} changed
            </Text>
            {groups.map(g => (
              <Tag key={g.key} color={g.tagColor} style={{ margin: 0 }}>
                {g.label}: {g.files.length}
              </Tag>
            ))}
          </div>
          <Button
            size="small"
            icon={<RobotOutlined />}
            onClick={handleSummarizeAll}
            loading={isSummarizingAll}
          >
            Summarize All
          </Button>
        </div>
      </Card>

      {/* Overall AI summary */}
      {overallSummary && (
        <Alert
          message="AI Summary"
          description={overallSummary}
          type="info"
          closable
          onClose={() => setOverallSummary(null)}
          style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}
          icon={<RobotOutlined />}
        />
      )}

      {/* Grouped file sections */}
      {groups.map(group => {
        const isCollapsed = collapsedGroups.has(group.key);

        return (
          <div key={group.key} style={{ marginBottom: 16 }}>
            {/* Group header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: `2px solid ${group.color}`,
                marginBottom: 4,
              }}
              onClick={() => toggleGroup(group.key)}
            >
              <RightOutlined
                rotate={isCollapsed ? 0 : 90}
                style={{ fontSize: 10, color: '#8c8c8c' }}
              />
              {group.icon}
              <Text strong>{group.label}</Text>
              <Badge
                count={group.files.length}
                style={{ backgroundColor: group.color }}
                size="small"
              />
            </div>

            {/* File list */}
            {!isCollapsed && (
              <div>
                {group.files.map(file => {
                  const isExpanded = expandedFiles.includes(file.path);
                  const fileSummary = fileSummaries[file.path];
                  const isSummarizing = summarizeMutation.isPending && summarizingFile === file.path;

                  return (
                    <div key={file.path}>
                      {/* File row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}
                        onClick={() => toggleFile(file.path)}
                      >
                        <RightOutlined
                          rotate={isExpanded ? 90 : 0}
                          style={{ fontSize: 10, color: '#8c8c8c' }}
                        />
                        <FileOutlined style={{ fontSize: 13, color: '#8c8c8c' }} />
                        <Text
                          style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }}
                          ellipsis
                        >
                          {file.path}
                        </Text>

                        {/* Actions (stop propagation to avoid toggling) */}
                        <div
                          style={{ display: 'flex', gap: 4 }}
                          onClick={e => e.stopPropagation()}
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={() => {
                              navigator.clipboard.writeText(file.path);
                              message.success('Copied');
                            }}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<RobotOutlined />}
                            onClick={() => handleSummarizeFile(file.path)}
                            loading={isSummarizing}
                          />
                        </div>
                      </div>

                      {/* Expanded: summary + diff */}
                      {isExpanded && (
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          {fileSummary && (
                            <Alert
                              message="AI Summary"
                              description={fileSummary}
                              type="success"
                              closable
                              onClose={() => {
                                setFileSummaries(prev => {
                                  const next = { ...prev };
                                  delete next[file.path];
                                  return next;
                                });
                              }}
                              style={{ margin: '8px 12px', whiteSpace: 'pre-wrap' }}
                              icon={<RobotOutlined />}
                            />
                          )}
                          <FileDiffViewer scope={selectedScope} file={file.path} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
