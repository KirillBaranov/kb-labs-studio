/**
 * @module @kb-labs/studio-app/modules/release/components/steps/preview-step
 * Step 2: Preview package contents before release
 */

import * as React from 'react';
import {
  Card,
  Space,
  Typography,
  Tag,
  Spin,
  Empty,
  Table,
  Progress,
  Button,
  Alert,
  message,
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  CheckCircleOutlined,
  BuildOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleasePreview, useTriggerBuild } from '@kb-labs/studio-data-client';
import { useQueryClient } from '@tanstack/react-query';
import type { PackageFile } from '@kb-labs/release-manager-contracts';

const { Text, Title } = Typography;

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get file extension
 */
function getFileExtension(path: string): string {
  const parts = path.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Get color for file type
 */
function getFileTypeColor(path: string): string {
  const ext = getFileExtension(path);
  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
      return '#f5a623';
    case 'ts':
    case 'tsx':
      return '#3178c6';
    case 'd.ts':
      return '#235a97';
    case 'json':
      return '#5a9c5a';
    case 'md':
      return '#083fa1';
    case 'map':
      return '#8c8c8c';
    default:
      return '#595959';
  }
}

interface PreviewStepProps {
  selectedScope: string;
  onPreviewReady: (ready: boolean) => void;
}

export function PreviewStep({ selectedScope, onPreviewReady }: PreviewStepProps) {
  const sources = useDataSources();
  const queryClient = useQueryClient();

  const { data: previewData, isLoading, error, refetch } = useReleasePreview(
    sources.release,
    selectedScope,
    !!selectedScope
  );

  const buildMutation = useTriggerBuild(sources.release);

  // Check if packages need build (buildStatus !== 'ready')
  const needsBuild = previewData?.packages.some((pkg) => pkg.buildStatus !== 'ready') ?? false;
  const allBuilt = previewData?.allBuilt ?? false;

  // Mark preview as ready when data loads AND all packages are built
  React.useEffect(() => {
    if (previewData && previewData.packages.length > 0 && allBuilt) {
      onPreviewReady(true);
    } else {
      onPreviewReady(false);
    }
  }, [previewData, allBuilt, onPreviewReady]);

  const handleBuild = async () => {
    try {
      const result = await buildMutation.mutateAsync({ scope: selectedScope });
      if (result.success) {
        message.success(`Build completed: ${result.builtCount}/${result.totalCount} packages`);
        // Refetch preview to get updated file list
        refetch();
      } else {
        message.error('Build failed');
      }
    } catch (err) {
      message.error(`Build failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Analyzing package contents...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Empty
          description={
            <Text type="danger">
              Failed to load package preview: {error instanceof Error ? error.message : 'Unknown error'}
            </Text>
          }
        />
      </Card>
    );
  }

  if (!previewData || previewData.packages.length === 0) {
    return (
      <Card>
        <Empty description="No packages found in release plan. Generate a plan first." />
      </Card>
    );
  }

  // Calculate stats
  const totalFiles = previewData.totalFiles;
  const totalSize = previewData.totalSize;

  // File type breakdown
  const fileTypes = new Map<string, { count: number; size: number }>();
  previewData.packages.forEach((pkg) => {
    pkg.files.forEach((file) => {
      const ext = getFileExtension(file.path) || 'other';
      const current = fileTypes.get(ext) || { count: 0, size: 0 };
      fileTypes.set(ext, {
        count: current.count + 1,
        size: current.size + file.size,
      });
    });
  });

  const sortedFileTypes = Array.from(fileTypes.entries())
    .sort((a, b) => b[1].size - a[1].size)
    .slice(0, 6);

  const columns = [
    {
      title: 'File',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => (
        <Space size={4}>
          <FileOutlined style={{ color: getFileTypeColor(path) }} />
          <Text code style={{ fontSize: 12 }}>{path}</Text>
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      align: 'right' as const,
      render: (size: number) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatBytes(size)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      {/* Summary Card */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size="large">
            <div>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                Total Files
              </Text>
              <Title level={3} style={{ margin: 0 }}>
                {totalFiles}
              </Title>
            </div>
            <div>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                Total Size
              </Text>
              <Title level={3} style={{ margin: 0 }}>
                {formatBytes(totalSize)}
              </Title>
            </div>
            <div>
              <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                Packages
              </Text>
              <Title level={3} style={{ margin: 0 }}>
                {previewData.packages.length}
              </Title>
            </div>
          </Space>

          <Space>
            {allBuilt ? (
              <>
                <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
                <Text strong style={{ color: '#52c41a' }}>Ready to publish</Text>
              </>
            ) : (
              <>
                <WarningOutlined style={{ color: '#faad14', fontSize: 24 }} />
                <Text strong style={{ color: '#faad14' }}>Build required</Text>
              </>
            )}
          </Space>
        </div>

        {/* Build action */}
        <div style={{ marginTop: 16 }}>
          <Space>
            <Button
              type="primary"
              icon={<BuildOutlined />}
              onClick={handleBuild}
              loading={buildMutation.isPending}
              size="small"
            >
              {buildMutation.isPending ? 'Building...' : needsBuild ? 'Build' : 'Rebuild'}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              disabled={buildMutation.isPending}
              size="small"
            >
              Refresh
            </Button>
          </Space>
          {needsBuild && (
            <Alert
              type="warning"
              message="Some packages need to be built before publishing"
              style={{ marginTop: 12 }}
              showIcon
            />
          )}
        </div>

        {/* File type breakdown */}
        <div style={{ marginTop: 24 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
            File Types
          </Text>
          <Space wrap>
            {sortedFileTypes.map(([ext, stats]) => (
              <Tag key={ext} style={{ margin: 0 }}>
                <span style={{ color: getFileTypeColor(`.${ext}`) }}>
                  .{ext}
                </span>
                {' '}{stats.count} ({formatBytes(stats.size)})
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      {/* Per-package breakdown */}
      {previewData.packages.map((pkg) => (
        <Card
          key={pkg.name}
          title={
            <Space>
              <FolderOutlined />
              <Text strong>{pkg.name}</Text>
              <Tag color="blue">v{pkg.version}</Tag>
            </Space>
          }
          extra={
            <Space>
              {pkg.buildStatus === 'ready' ? (
                <Tag color="success">Built</Tag>
              ) : pkg.buildStatus === 'building' ? (
                <Tag color="processing">Building...</Tag>
              ) : (
                <Tag color="warning">Not built</Tag>
              )}
              <Tag>{pkg.fileCount} files</Tag>
              <Tag color="green">{formatBytes(pkg.totalSize)}</Tag>
            </Space>
          }
          style={{ marginBottom: 16 }}
          size="small"
        >
          {/* Size breakdown bar */}
          <div style={{ marginBottom: 16 }}>
            <Progress
              percent={100}
              success={{ percent: (pkg.files.filter(f => f.path.endsWith('.js') || f.path.endsWith('.mjs')).reduce((s, f) => s + f.size, 0) / pkg.totalSize) * 100 }}
              strokeColor="#3178c6"
              trailColor="#f0f0f0"
              showInfo={false}
              size="small"
            />
            <div style={{ display: 'flex', gap: 16, marginTop: 4, fontSize: 11 }}>
              <Text type="secondary">
                <span style={{ color: '#52c41a' }}>■</span> JS
              </Text>
              <Text type="secondary">
                <span style={{ color: '#3178c6' }}>■</span> Types
              </Text>
              <Text type="secondary">
                <span style={{ color: '#f0f0f0' }}>■</span> Other
              </Text>
            </div>
          </div>

          <Table
            dataSource={pkg.files}
            columns={columns}
            rowKey="path"
            size="small"
            pagination={pkg.files.length > 10 ? { pageSize: 10, size: 'small' } : false}
            scroll={{ y: 300 }}
          />
        </Card>
      ))}
    </div>
  );
}
