/**
 * @module @kb-labs/studio-app/modules/commit/components/files-tab-new
 * Files tab - GitHub/GitLab style file viewer with expandable diffs
 *
 * TODO: TEMPORARY - Remove after commit plugin UI is polished
 */

import { useState } from 'react';
import { Card, Empty, Skeleton, Tag, Collapse, Typography, Button, Alert, message } from 'antd';
import { FileOutlined, RobotOutlined, CopyOutlined } from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQuery } from '@tanstack/react-query';
import { KBDiffViewer } from '@kb-labs/studio-ui-react';
import { useSummarizeChanges } from '@kb-labs/studio-data-client';

const { Panel } = Collapse;
const { Text } = Typography;

interface FilesTabNewProps {
  selectedScope: string;
}

interface FileDiffViewerProps {
  scope: string;
  file: string;
}

function FileDiffViewer({ scope, file }: FileDiffViewerProps) {
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
      <KBDiffViewer diff={diffData.diff} maxHeight={500} />
    </div>
  );
}


export function FilesTabNew({ selectedScope }: FilesTabNewProps) {
  const sources = useDataSources();
  const [expandedFiles, setExpandedFiles] = useState<string[]>([]);
  const [overallSummary, setOverallSummary] = useState<string | null>(null);
  const [fileSummaries, setFileSummaries] = useState<Record<string, string>>({});
  const [summarizingFile, setSummarizingFile] = useState<string | null>(null);
  const [isSummarizingAll, setIsSummarizingAll] = useState(false);

  // Fetch git status
  const { data: gitStatusData, isLoading: gitStatusLoading } = useQuery({
    queryKey: ['commit', 'git-status', selectedScope],
    queryFn: () => sources.commit.getGitStatus(selectedScope),
    enabled: !!selectedScope,
  });

  // Summarize mutation hook
  const summarizeMutation = useSummarizeChanges(sources.commit);

  // Handler: Summarize all changes
  const handleSummarizeAll = async () => {
    setIsSummarizingAll(true);
    try {
      const result = await summarizeMutation.mutateAsync({
        scope: selectedScope,
      });
      setOverallSummary(result.summary);
      message.success('Summary generated successfully');
    } catch (error) {
      message.error('Failed to generate summary');
      console.error('Summarize error:', error);
    } finally {
      setIsSummarizingAll(false);
    }
  };

  // Handler: Summarize specific file
  const handleSummarizeFile = async (file: string) => {
    setSummarizingFile(file);
    try {
      const result = await summarizeMutation.mutateAsync({
        scope: selectedScope,
        file,
      });
      setFileSummaries((prev) => ({ ...prev, [file]: result.summary }));
      message.success(`Summary generated for ${file}`);
    } catch (error) {
      message.error(`Failed to generate summary for ${file}`);
      console.error('Summarize file error:', error);
    } finally {
      setSummarizingFile(null);
    }
  };

  // Handler: Copy file path to clipboard
  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path).then(
      () => {
        message.success(`Copied: ${path}`);
      },
      () => {
        message.error('Failed to copy path');
      }
    );
  };

  // Handler: Clear file summary
  const handleClearSummary = (path: string) => {
    setFileSummaries((prev) => {
      const newSummaries = { ...prev };
      delete newSummaries[path];
      return newSummaries;
    });
  };

  if (!selectedScope) {
    return (
      <Empty
        description="Please select a scope to continue"
        style={{ marginTop: 48 }}
      />
    );
  }

  if (gitStatusLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  // Backend returns TableData with rows array
  const files = gitStatusData?.rows || [];

  if (files.length === 0) {
    return (
      <Card>
        <Empty
          image={<FileOutlined style={{ fontSize: 64, color: '#8c8c8c' }} />}
          description="No files changed"
        />
      </Card>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 16 }}>
            📊 {files.length} file{files.length !== 1 ? 's' : ''} changed
          </Text>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={handleSummarizeAll}
            loading={isSummarizingAll}
          >
            Summarize All Changes
          </Button>
        </div>
      </Card>

      {overallSummary && (
        <Alert
          message="AI Summary: All Changes"
          description={overallSummary}
          type="info"
          closable
          onClose={() => setOverallSummary(null)}
          style={{ marginBottom: 16, whiteSpace: 'pre-wrap' }}
          icon={<RobotOutlined />}
        />
      )}

      <Collapse
        bordered={false}
        activeKey={expandedFiles}
        onChange={(keys) => setExpandedFiles(Array.isArray(keys) ? keys as string[] : [keys as string])}
        style={{
          background: 'transparent',
        }}
      >
        {files.map((file: any) => {
          const isExpanded = expandedFiles.includes(file.path);
          const fileSummary = fileSummaries[file.path];
          const isLoading = summarizeMutation.isPending && summarizingFile === file.path;

          return (
            <Panel
              key={file.path}
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <FileOutlined />
                    <Text strong>{file.path}</Text>
                    <Tag color={getStatusColor(file.status)}>
                      {file.status?.toUpperCase() || 'MODIFIED'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopyPath(file.path)}
                    >
                      Copy Path
                    </Button>
                    <Button
                      size="small"
                      type="default"
                      icon={<RobotOutlined />}
                      onClick={() => handleSummarizeFile(file.path)}
                      loading={isLoading}
                    >
                      Summarize
                    </Button>
                  </div>
                </div>
              }
              style={{
                marginBottom: 8,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
              }}
            >
              {fileSummary && (
                <Alert
                  message={`AI Summary: ${file.path}`}
                  description={fileSummary}
                  type="success"
                  closable
                  onClose={() => handleClearSummary(file.path)}
                  style={{ margin: '16px 16px 8px 16px', whiteSpace: 'pre-wrap' }}
                  icon={<RobotOutlined />}
                />
              )}
              {isExpanded && <FileDiffViewer scope={selectedScope} file={file.path} />}
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    modified: 'orange',
    added: 'green',
    deleted: 'red',
    renamed: 'blue',
    untracked: 'default',
  };
  return colors[status?.toLowerCase()] || 'default';
}
