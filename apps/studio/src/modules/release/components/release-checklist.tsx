/**
 * @module @kb-labs/studio-app/modules/release/components/release-checklist
 * Unified checklist-based release flow
 */

import * as React from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Collapse,
  Input,
  Divider,
  Spin,
  Result,
  message,
  Popconfirm,
} from 'antd';
import {
  FileTextOutlined,
  EditOutlined,
  BuildOutlined,
  FolderOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleaseChecklist,
  useReleasePlan,
  useReleaseChangelog,
  useReleasePreview,
  useGenerateReleasePlan,
  useGenerateChangelog,
  useTriggerBuild,
  useRunRelease,
  useRollback,
  releaseQueryKeys,
} from '@kb-labs/studio-data-client';
import type { ChecklistItemStatus } from '@kb-labs/release-manager-contracts';
import { useQueryClient } from '@tanstack/react-query';

const { Text, Title } = Typography;

interface ReleaseChecklistProps {
  selectedScope: string;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) {return '0 B';}
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Get status icon based on checklist item status
 */
function getStatusIcon(status: ChecklistItemStatus) {
  switch (status) {
    case 'ready':
      return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    case 'pending':
      return <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />;
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} />;
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    case 'running':
      return <LoadingOutlined style={{ color: '#1890ff', fontSize: 18 }} />;
    default:
      return <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />;
  }
}

/**
 * Get status color for Tag
 */
function getStatusColor(status: ChecklistItemStatus): string {
  switch (status) {
    case 'ready':
      return 'success';
    case 'pending':
      return 'default';
    case 'warning':
      return 'warning';
    case 'error':
      return 'error';
    case 'running':
      return 'processing';
    default:
      return 'default';
  }
}

export function ReleaseChecklist({ selectedScope }: ReleaseChecklistProps) {
  const sources = useDataSources();
  const queryClient = useQueryClient();

  // OTP state
  const [otp, setOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState('');

  // Release state
  const [releaseComplete, setReleaseComplete] = React.useState(false);

  // Expanded panels state
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);

  // Queries
  const { data: checklist, isLoading: checklistLoading } = useReleaseChecklist(
    sources.release,
    selectedScope,
    !!selectedScope
  );

  const { data: planData } = useReleasePlan(sources.release, selectedScope, !!selectedScope);
  const { data: changelogData } = useReleaseChangelog(sources.release, selectedScope, undefined, !!selectedScope);
  const { data: previewData } = useReleasePreview(sources.release, selectedScope, !!selectedScope);

  // Mutations
  const generatePlanMutation = useGenerateReleasePlan(sources.release);
  const generateChangelogMutation = useGenerateChangelog(sources.release);
  const triggerBuildMutation = useTriggerBuild(sources.release);
  const runReleaseMutation = useRunRelease(sources.release);
  const rollbackMutation = useRollback(sources.release);

  // Handlers
  const handleGeneratePlan = async () => {
    try {
      await generatePlanMutation.mutateAsync({ scope: selectedScope });
      message.success('Release plan generated');
      setExpandedKeys(['plan']);
    } catch (error) {
      message.error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateChangelog = async () => {
    try {
      await generateChangelogMutation.mutateAsync({ scope: selectedScope });
      message.success('Changelog generated');
      setExpandedKeys(['changelog']);
    } catch (error) {
      message.error(`Failed to generate changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBuild = async () => {
    try {
      const result = await triggerBuildMutation.mutateAsync({ scope: selectedScope });
      if (result.success) {
        message.success('Build completed successfully');
        setExpandedKeys(['preview']);
      } else {
        message.error('Build failed');
      }
    } catch (error) {
      message.error(`Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePublish = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      setOtpError('Enter a valid 6-digit OTP');
      return;
    }
    setOtpError('');

    try {
      await runReleaseMutation.mutateAsync({
        scope: selectedScope,
        dryRun: false,
        otp,
      });
      setReleaseComplete(true);
      message.success('Release published successfully!');
    } catch (error) {
      message.error(`Release failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRollback = async () => {
    try {
      await rollbackMutation.mutateAsync({ scope: selectedScope });
      message.success('Rollback completed');
      setReleaseComplete(false);
      setOtp('');
    } catch (error) {
      message.error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: releaseQueryKeys.checklist(selectedScope) });
    queryClient.invalidateQueries({ queryKey: releaseQueryKeys.plan(selectedScope) });
    queryClient.invalidateQueries({ queryKey: releaseQueryKeys.changelog(selectedScope) });
    queryClient.invalidateQueries({ queryKey: releaseQueryKeys.preview(selectedScope) });
  };

  if (!selectedScope) {
    return (
      <Card>
        <Result
          status="info"
          title="Select a scope"
          subTitle="Please select a package or monorepo scope to start the release process."
        />
      </Card>
    );
  }

  if (checklistLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Loading release checklist...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (releaseComplete) {
    return (
      <Card>
        <Result
          status="success"
          title="Release Published!"
          subTitle={`${planData?.plan?.packages.length ?? 0} package(s) published to npm`}
          extra={[
            <Popconfirm
              key="rollback"
              title="Rollback Release"
              description="This will unpublish the packages. Are you sure?"
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              onConfirm={handleRollback}
              okText="Yes, Rollback"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button icon={<RollbackOutlined />} loading={rollbackMutation.isPending} danger>
                Rollback
              </Button>
            </Popconfirm>,
            <Button key="new" type="primary" onClick={() => {
              setReleaseComplete(false);
              setOtp('');
              handleRefresh();
            }}>
              Start New Release
            </Button>,
          ]}
        />
      </Card>
    );
  }

  const items = [
    // 1. Plan
    {
      key: 'plan',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            {getStatusIcon(checklist?.plan.status ?? 'pending')}
            <Text strong>1. Plan</Text>
            {checklist?.plan.packagesCount && (
              <Tag color="blue">{checklist.plan.packagesCount} package(s)</Tag>
            )}
            {checklist?.plan.bump && <Tag>{checklist.plan.bump}</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{checklist?.plan.message}</Text>
        </div>
      ),
      children: (
        <div>
          {planData?.plan ? (
            <div>
              {planData.plan.packages.map((pkg) => (
                <div key={pkg.name} style={{ marginBottom: 8 }}>
                  <Text code>{pkg.name}</Text>
                  <Text type="secondary"> {pkg.currentVersion} → </Text>
                  <Text strong style={{ color: '#52c41a' }}>{pkg.nextVersion}</Text>
                  <Tag style={{ marginLeft: 8 }}>{pkg.bump}</Tag>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Text type="secondary">No plan generated yet</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  onClick={handleGeneratePlan}
                  loading={generatePlanMutation.isPending}
                >
                  Generate Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
      extra: checklist?.plan.status !== 'ready' && (
        <Button
          size="small"
          type="primary"
          icon={<FileTextOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleGeneratePlan();
          }}
          loading={generatePlanMutation.isPending}
        >
          Generate
        </Button>
      ),
    },

    // 2. Changelog
    {
      key: 'changelog',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            {getStatusIcon(checklist?.changelog.status ?? 'pending')}
            <Text strong>2. Changelog</Text>
            {checklist?.changelog.commitsCount && (
              <Tag color="blue">{checklist.changelog.commitsCount} changes</Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{checklist?.changelog.message}</Text>
        </div>
      ),
      children: (
        <div>
          {changelogData?.markdown ? (
            <div style={{
              maxHeight: 300,
              overflow: 'auto',
              background: '#fafafa',
              padding: 16,
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}>
              {changelogData.markdown}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Text type="secondary">No changelog generated yet</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleGenerateChangelog}
                  loading={generateChangelogMutation.isPending}
                  disabled={checklist?.plan.status !== 'ready'}
                >
                  Generate Changelog
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
      extra: checklist?.changelog.status !== 'ready' && checklist?.plan.status === 'ready' && (
        <Button
          size="small"
          type="primary"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleGenerateChangelog();
          }}
          loading={generateChangelogMutation.isPending}
        >
          Generate
        </Button>
      ),
    },

    // 3. Build
    {
      key: 'build',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            {triggerBuildMutation.isPending
              ? <LoadingOutlined style={{ color: '#1890ff', fontSize: 18 }} />
              : getStatusIcon(checklist?.build.status ?? 'pending')
            }
            <Text strong>3. Build</Text>
            {checklist?.build.builtCount !== undefined && checklist?.build.totalCount !== undefined && (
              <Tag color={checklist.build.builtCount === checklist.build.totalCount ? 'success' : 'warning'}>
                {checklist.build.builtCount}/{checklist.build.totalCount} built
              </Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{checklist?.build.message}</Text>
        </div>
      ),
      children: (
        <div style={{ textAlign: 'center', padding: 16 }}>
          {checklist?.build.status === 'ready' ? (
            <Result
              status="success"
              title="All packages built"
              subTitle="Ready for preview and publish"
            />
          ) : (
            <>
              <Text type="secondary">Run build to compile packages before publishing</Text>
              <div style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<BuildOutlined />}
                  onClick={handleBuild}
                  loading={triggerBuildMutation.isPending}
                  disabled={checklist?.changelog.status !== 'ready'}
                >
                  {triggerBuildMutation.isPending ? 'Building...' : 'Run Build'}
                </Button>
              </div>
            </>
          )}
        </div>
      ),
      extra: checklist?.build.status !== 'ready' && checklist?.changelog.status === 'ready' && (
        <Button
          size="small"
          type="primary"
          icon={<BuildOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleBuild();
          }}
          loading={triggerBuildMutation.isPending}
        >
          Build
        </Button>
      ),
    },

    // 4. Preview
    {
      key: 'preview',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Space>
            {getStatusIcon(checklist?.preview.status ?? 'pending')}
            <Text strong>4. Preview</Text>
            {checklist?.preview.filesCount && (
              <Tag color="blue">{checklist.preview.filesCount} files</Tag>
            )}
            {checklist?.preview.totalSize && (
              <Tag color="green">{formatBytes(checklist.preview.totalSize)}</Tag>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>{checklist?.preview.message}</Text>
        </div>
      ),
      children: (
        <div>
          {previewData?.packages && previewData.packages.length > 0 ? (
            <div>
              {previewData.packages.map((pkg) => (
                <Card key={pkg.name} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Space>
                      <FolderOutlined />
                      <Text strong>{pkg.name}</Text>
                      <Tag color="blue">v{pkg.version}</Tag>
                    </Space>
                    <Space>
                      <Tag>{pkg.fileCount} files</Tag>
                      <Tag color="green">{formatBytes(pkg.totalSize)}</Tag>
                    </Space>
                  </div>
                  <div style={{
                    maxHeight: 150,
                    overflow: 'auto',
                    background: '#fafafa',
                    padding: 8,
                    borderRadius: 4,
                    fontSize: 12,
                  }}>
                    {pkg.files.map((file) => (
                      <div key={file.path} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text code style={{ fontSize: 11 }}>{file.path}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{formatBytes(file.size)}</Text>
                      </div>
                    ))}
                    {pkg.files.length === 0 && pkg.expectedFiles && (
                      <div>
                        <Text type="warning">Expected files (build required):</Text>
                        {pkg.expectedFiles.map((f) => (
                          <div key={f}>
                            <Text type="secondary" style={{ fontSize: 11 }}>{f}</Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Text type="secondary">
                {checklist?.build.status === 'ready'
                  ? 'Loading preview...'
                  : 'Complete build step to see file preview'
                }
              </Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header Card */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space>
            <Title level={4} style={{ margin: 0 }}>Release: {selectedScope}</Title>
            {planData?.plan && (
              <Tag color="blue">
                v{planData.plan.packages[0]?.currentVersion} → v{planData.plan.packages[0]?.nextVersion}
              </Tag>
            )}
          </Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Checklist */}
      <Collapse
        activeKey={expandedKeys}
        onChange={(keys) => setExpandedKeys(keys as string[])}
        items={items}
        style={{ marginBottom: 16 }}
      />

      {/* Publish Section */}
      <Card
        title={
          <Space>
            <RocketOutlined />
            <span>5. Publish to npm</span>
            {checklist?.canPublish && <Tag color="success">Ready</Tag>}
          </Space>
        }
      >
        {!checklist?.canPublish ? (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Text type="secondary">Complete all steps above to enable publishing</Text>
            <div style={{ marginTop: 16 }}>
              <Space>
                {checklist?.plan.status !== 'ready' && <Tag color={getStatusColor(checklist?.plan.status ?? 'pending')}>Plan</Tag>}
                {checklist?.changelog.status !== 'ready' && <Tag color={getStatusColor(checklist?.changelog.status ?? 'pending')}>Changelog</Tag>}
                {checklist?.build.status !== 'ready' && <Tag color={getStatusColor(checklist?.build.status ?? 'pending')}>Build</Tag>}
                {checklist?.preview.status !== 'ready' && <Tag color={getStatusColor(checklist?.preview.status ?? 'pending')}>Preview</Tag>}
              </Space>
            </div>
          </div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* OTP Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                npm One-Time Password (OTP)
              </Text>
              <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                Enter the 6-digit code from your authenticator app
              </Text>
              <Input
                prefix={<LockOutlined />}
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                maxLength={6}
                style={{ width: 200, fontSize: 18, letterSpacing: 8 }}
                status={otpError ? 'error' : undefined}
              />
              {otpError && (
                <Text type="danger" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                  {otpError}
                </Text>
              )}
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Publish Button */}
            <Button
              type="primary"
              size="large"
              icon={<RocketOutlined />}
              onClick={handlePublish}
              loading={runReleaseMutation.isPending}
              disabled={!otp}
              block
            >
              Publish to npm
            </Button>

            <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
              This action will publish {planData?.plan?.packages.length ?? 0} package(s) to the npm registry
            </Text>
          </Space>
        )}
      </Card>
    </div>
  );
}
