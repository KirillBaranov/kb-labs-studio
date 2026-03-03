/**
 * @module @kb-labs/studio-app/modules/release/components/release-checklist
 * Unified checklist-based release flow
 */

import * as React from 'react';
import {
  UICard,
  UIButton,
  UISpace,
  UITypographyText,
  UITitle,
  UITag,
  UIAccordion,
  UIInput,
  UIDivider,
  UISpin,
  UIResult,
  UIMessage,
  UIPopconfirm,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
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
      return <UIIcon name="CheckCircleOutlined" style={{ color: '#52c41a', fontSize: 18 }} />;
    case 'pending':
      return <UIIcon name="ClockCircleOutlined" style={{ color: '#8c8c8c', fontSize: 18 }} />;
    case 'warning':
      return <UIIcon name="WarningOutlined" style={{ color: '#faad14', fontSize: 18 }} />;
    case 'error':
      return <UIIcon name="CloseCircleOutlined" style={{ color: '#ff4d4f', fontSize: 18 }} />;
    case 'running':
      return <UIIcon name="LoadingOutlined" style={{ color: '#1890ff', fontSize: 18 }} />;
    default:
      return <UIIcon name="ClockCircleOutlined" style={{ color: '#8c8c8c', fontSize: 18 }} />;
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
      await generatePlanMutation.mutateAsync({ scope: selectedScope, useLLM: false });
      UIMessage.success('Release plan generated');
      setExpandedKeys(['plan']);
    } catch (error) {
      UIMessage.error(`Failed to generate plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGenerateChangelog = async () => {
    try {
      await generateChangelogMutation.mutateAsync({ scope: selectedScope, useLLM: false });
      UIMessage.success('Changelog generated');
      setExpandedKeys(['changelog']);
    } catch (error) {
      UIMessage.error(`Failed to generate changelog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBuild = async () => {
    try {
      const result = await triggerBuildMutation.mutateAsync({ scope: selectedScope });
      if (result.success) {
        UIMessage.success('Build completed successfully');
        setExpandedKeys(['preview']);
      } else {
        UIMessage.error('Build failed');
      }
    } catch (error) {
      UIMessage.error(`Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      UIMessage.success('Release published successfully!');
    } catch (error) {
      UIMessage.error(`Release failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRollback = async () => {
    try {
      await rollbackMutation.mutateAsync({ scope: selectedScope });
      UIMessage.success('Rollback completed');
      setReleaseComplete(false);
      setOtp('');
    } catch (error) {
      UIMessage.error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <UICard>
        <UIResult
          status="info"
          title="Select a scope"
          subTitle="Please select a package or monorepo scope to start the release process."
        />
      </UICard>
    );
  }

  if (checklistLoading) {
    return (
      <UICard>
        <div style={{ textAlign: 'center', padding: 48 }}>
          <UISpin size="large" />
          <div style={{ marginTop: 16 }}>
            <UITypographyText type="secondary">Loading release checklist...</UITypographyText>
          </div>
        </div>
      </UICard>
    );
  }

  if (releaseComplete) {
    return (
      <UICard>
        <UIResult
          status="success"
          title="Release Published!"
          subTitle={`${planData?.plan?.packages.length ?? 0} package(s) published to npm`}
          extra={[
            <UIPopconfirm
              key="rollback"
              title="Rollback Release"
              description="This will unpublish the packages. Are you sure?"
              icon={<UIIcon name="ExclamationCircleOutlined" style={{ color: '#ff4d4f' }} />}
              onConfirm={handleRollback}
              okText="Yes, Rollback"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <UIButton icon={<UIIcon name="RollbackOutlined" />} loading={rollbackMutation.isPending} danger>
                Rollback
              </UIButton>
            </UIPopconfirm>,
            <UIButton key="new" variant="primary" onClick={() => {
              setReleaseComplete(false);
              setOtp('');
              handleRefresh();
            }}>
              Start New Release
            </UIButton>,
          ]}
        />
      </UICard>
    );
  }

  const items = [
    // 1. Plan
    {
      key: 'plan',
      label: '1. Plan',
      children: (
        <div>
          {planData?.plan ? (
            <div>
              {planData.plan.packages.map((pkg) => (
                <div key={pkg.name} style={{ marginBottom: 8 }}>
                  <UITypographyText code>{pkg.name}</UITypographyText>
                  <UITypographyText type="secondary"> {pkg.currentVersion} → </UITypographyText>
                  <UITypographyText strong style={{ color: '#52c41a' }}>{pkg.nextVersion}</UITypographyText>
                  <UITag style={{ marginLeft: 8 }}>{pkg.bump}</UITag>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <UITypographyText type="secondary">No plan generated yet</UITypographyText>
              <div style={{ marginTop: 16 }}>
                <UIButton
                  variant="primary"
                  icon={<UIIcon name="FileTextOutlined" />}
                  onClick={handleGeneratePlan}
                  loading={generatePlanMutation.isPending}
                >
                  Generate Plan
                </UIButton>
              </div>
            </div>
          )}
        </div>
      ),
      extra: (
        <UISpace>
          {getStatusIcon(checklist?.plan.status ?? 'pending')}
          {checklist?.plan.packagesCount && (
            <UITag color="blue">{checklist.plan.packagesCount} package(s)</UITag>
          )}
          {checklist?.plan.bump && <UITag>{checklist.plan.bump}</UITag>}
          {checklist?.plan.message && (
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>{checklist.plan.message}</UITypographyText>
          )}
          {checklist?.plan.status !== 'ready' && (
            <UIButton
              size="small"
              variant="primary"
              icon={<UIIcon name="FileTextOutlined" />}
              onClick={(e) => {
                e.stopPropagation();
                handleGeneratePlan();
              }}
              loading={generatePlanMutation.isPending}
            >
              Generate
            </UIButton>
          )}
        </UISpace>
      ),
    },

    // 2. Changelog
    {
      key: 'changelog',
      label: '2. Changelog',
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
              <UITypographyText type="secondary">No changelog generated yet</UITypographyText>
              <div style={{ marginTop: 16 }}>
                <UIButton
                  variant="primary"
                  icon={<UIIcon name="EditOutlined" />}
                  onClick={handleGenerateChangelog}
                  loading={generateChangelogMutation.isPending}
                  disabled={checklist?.plan.status !== 'ready'}
                >
                  Generate Changelog
                </UIButton>
              </div>
            </div>
          )}
        </div>
      ),
      extra: (
        <UISpace>
          {getStatusIcon(checklist?.changelog.status ?? 'pending')}
          {checklist?.changelog.commitsCount && (
            <UITag color="blue">{checklist.changelog.commitsCount} changes</UITag>
          )}
          {checklist?.changelog.message && (
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>{checklist.changelog.message}</UITypographyText>
          )}
          {checklist?.changelog.status !== 'ready' && checklist?.plan.status === 'ready' && (
            <UIButton
              size="small"
              variant="primary"
              icon={<UIIcon name="EditOutlined" />}
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateChangelog();
              }}
              loading={generateChangelogMutation.isPending}
            >
              Generate
            </UIButton>
          )}
        </UISpace>
      ),
    },

    // 3. Build
    {
      key: 'build',
      label: '3. Build',
      children: (
        <div style={{ textAlign: 'center', padding: 16 }}>
          {checklist?.build.status === 'ready' ? (
            <UIResult
              status="success"
              title="All packages built"
              subTitle="Ready for preview and publish"
            />
          ) : (
            <>
              <UITypographyText type="secondary">Run build to compile packages before publishing</UITypographyText>
              <div style={{ marginTop: 16 }}>
                <UIButton
                  variant="primary"
                  icon={<UIIcon name="BuildOutlined" />}
                  onClick={handleBuild}
                  loading={triggerBuildMutation.isPending}
                  disabled={checklist?.changelog.status !== 'ready'}
                >
                  {triggerBuildMutation.isPending ? 'Building...' : 'Run Build'}
                </UIButton>
              </div>
            </>
          )}
        </div>
      ),
      extra: (
        <UISpace>
          {triggerBuildMutation.isPending
            ? <UIIcon name="LoadingOutlined" style={{ color: '#1890ff', fontSize: 18 }} />
            : getStatusIcon(checklist?.build.status ?? 'pending')
          }
          {checklist?.build.builtCount !== undefined && checklist?.build.totalCount !== undefined && (
            <UITag color={checklist.build.builtCount === checklist.build.totalCount ? 'success' : 'warning'}>
              {checklist.build.builtCount}/{checklist.build.totalCount} built
            </UITag>
          )}
          {checklist?.build.message && (
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>{checklist.build.message}</UITypographyText>
          )}
          {checklist?.build.status !== 'ready' && checklist?.changelog.status === 'ready' && (
            <UIButton
              size="small"
              variant="primary"
              icon={<UIIcon name="BuildOutlined" />}
              onClick={(e) => {
                e.stopPropagation();
                handleBuild();
              }}
              loading={triggerBuildMutation.isPending}
            >
              Build
            </UIButton>
          )}
        </UISpace>
      ),
    },

    // 4. Preview
    {
      key: 'preview',
      label: '4. Preview',
      extra: (
        <UISpace>
          {getStatusIcon(checklist?.preview.status ?? 'pending')}
          {checklist?.preview.filesCount && (
            <UITag color="blue">{checklist.preview.filesCount} files</UITag>
          )}
          {checklist?.preview.totalSize && (
            <UITag color="green">{formatBytes(checklist.preview.totalSize)}</UITag>
          )}
          {checklist?.preview.message && (
            <UITypographyText type="secondary" style={{ fontSize: 12 }}>{checklist.preview.message}</UITypographyText>
          )}
        </UISpace>
      ),
      children: (
        <div>
          {previewData?.packages && previewData.packages.length > 0 ? (
            <div>
              {previewData.packages.map((pkg) => (
                <UICard key={pkg.name} size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <UISpace>
                      <UIIcon name="FolderOutlined" />
                      <UITypographyText strong>{pkg.name}</UITypographyText>
                      <UITag color="blue">v{pkg.version}</UITag>
                    </UISpace>
                    <UISpace>
                      <UITag>{pkg.fileCount} files</UITag>
                      <UITag color="green">{formatBytes(pkg.totalSize)}</UITag>
                    </UISpace>
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
                        <UITypographyText code style={{ fontSize: 11 }}>{file.path}</UITypographyText>
                        <UITypographyText type="secondary" style={{ fontSize: 11 }}>{formatBytes(file.size)}</UITypographyText>
                      </div>
                    ))}
                    {pkg.files.length === 0 && pkg.expectedFiles && (
                      <div>
                        <UITypographyText type="warning">Expected files (build required):</UITypographyText>
                        {pkg.expectedFiles.map((f) => (
                          <div key={f}>
                            <UITypographyText type="secondary" style={{ fontSize: 11 }}>{f}</UITypographyText>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </UICard>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <UITypographyText type="secondary">
                {checklist?.build.status === 'ready'
                  ? 'Loading preview...'
                  : 'Complete build step to see file preview'
                }
              </UITypographyText>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header Card */}
      <UICard size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <UISpace>
            <UITitle level={4} style={{ margin: 0 }}>Release: {selectedScope}</UITitle>
            {planData?.plan && (
              <UITag color="blue">
                v{planData.plan.packages[0]?.currentVersion} → v{planData.plan.packages[0]?.nextVersion}
              </UITag>
            )}
          </UISpace>
          <UIButton
            icon={<UIIcon name="ReloadOutlined" />}
            onClick={handleRefresh}
            size="small"
          >
            Refresh
          </UIButton>
        </div>
      </UICard>

      {/* Checklist */}
      <UIAccordion
        activeKey={expandedKeys}
        onChange={(keys) => setExpandedKeys(keys as string[])}
        items={items}
        style={{ marginBottom: 16 }}
      />

      {/* Publish Section */}
      <UICard
        title={
          <UISpace>
            <UIIcon name="RocketOutlined" />
            <span>5. Publish to npm</span>
            {checklist?.canPublish && <UITag color="success">Ready</UITag>}
          </UISpace>
        }
      >
        {!checklist?.canPublish ? (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <UITypographyText type="secondary">Complete all steps above to enable publishing</UITypographyText>
            <div style={{ marginTop: 16 }}>
              <UISpace>
                {checklist?.plan.status !== 'ready' && <UITag color={getStatusColor(checklist?.plan.status ?? 'pending')}>Plan</UITag>}
                {checklist?.changelog.status !== 'ready' && <UITag color={getStatusColor(checklist?.changelog.status ?? 'pending')}>Changelog</UITag>}
                {checklist?.build.status !== 'ready' && <UITag color={getStatusColor(checklist?.build.status ?? 'pending')}>Build</UITag>}
                {checklist?.preview.status !== 'ready' && <UITag color={getStatusColor(checklist?.preview.status ?? 'pending')}>Preview</UITag>}
              </UISpace>
            </div>
          </div>
        ) : (
          <UISpace direction="vertical" style={{ width: '100%' }} size="middle">
            {/* OTP Input */}
            <div>
              <UITypographyText strong style={{ display: 'block', marginBottom: 8 }}>
                npm One-Time Password (OTP)
              </UITypographyText>
              <UITypographyText type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                Enter the 6-digit code from your authenticator app
              </UITypographyText>
              <UIInput
                prefix={<UIIcon name="LockOutlined" />}
                placeholder="123456"
                value={otp}
                onChange={(value) => {
                  setOtp(value.replace(/\D/g, '').slice(0, 6));
                  setOtpError('');
                }}
                maxLength={6}
                style={{ width: 200, fontSize: 18, letterSpacing: 8 }}
                status={otpError ? 'error' : undefined}
              />
              {otpError && (
                <UITypographyText type="danger" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                  {otpError}
                </UITypographyText>
              )}
            </div>

            <UIDivider style={{ margin: '8px 0' }} />

            {/* Publish Button */}
            <UIButton
              variant="primary"
              size="large"
              icon={<UIIcon name="RocketOutlined" />}
              onClick={handlePublish}
              loading={runReleaseMutation.isPending}
              disabled={!otp}
              block
            >
              Publish to npm
            </UIButton>

            <UITypographyText type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
              This action will publish {planData?.plan?.packages.length ?? 0} package(s) to the npm registry
            </UITypographyText>
          </UISpace>
        )}
      </UICard>
    </div>
  );
}
