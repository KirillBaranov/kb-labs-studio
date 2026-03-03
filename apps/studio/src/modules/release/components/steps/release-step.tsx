/**
 * @module @kb-labs/studio-app/modules/release/components/steps/release-step
 * Step 4: Pre-checks, OTP input, publish, and rollback
 */

import * as React from 'react';
import {
  UIButton,
  UICard,
  UISpace,
  UITypographyText,
  UIAlert,
  UIInput,
  UIResult,
  UIAccordion,
  UITag,
  UIPopconfirm,
  UIDivider,
  UIMessage,
  UIIcon,
  UISkeleton,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleasePlan,
  useRunRelease,
  useRollback,
  useRunChecks,
  useGetChecks,
} from '@kb-labs/studio-data-client';

type CheckStatus = 'pending' | 'running' | 'success' | 'error';

interface PreCheck {
  id: string;
  name: string;
  status: CheckStatus;
  error?: string;
  duration?: number;
  optional?: boolean;
}

interface ReleaseStepProps {
  selectedScope: string;
  onReleaseComplete: () => void;
}

export function ReleaseStep({ selectedScope, onReleaseComplete }: ReleaseStepProps) {
  const sources = useDataSources();

  // OTP state
  const [otp, setOtp] = React.useState('');
  const [otpError, setOtpError] = React.useState('');

  // Pre-checks state — populated from API on mount
  const [checks, setChecks] = React.useState<PreCheck[]>([]);
  const [checksComplete, setChecksComplete] = React.useState(false);
  const [checksRunning, setChecksRunning] = React.useState(false);

  // Release state
  const [releaseStarted, setReleaseStarted] = React.useState(false);
  const [releaseComplete, setReleaseComplete] = React.useState(false);
  const [releaseError, setReleaseError] = React.useState<string | null>(null);

  // Fetch plan to show summary
  const { data: planData } = useReleasePlan(sources.release, selectedScope, !!selectedScope);

  // Fetch configured checks from API (shows what will run before actually running)
  const { data: checksConfig, isLoading: checksConfigLoading } = useGetChecks(sources.release, selectedScope, !!selectedScope);

  // Sync check definitions from API into local state (pending) when loaded and not yet run
  React.useEffect(() => {
    if (checksConfig && !checksComplete && !checksRunning && checks.length === 0) {
      setChecks(checksConfig.checks.map((c) => ({
        id: c.id,
        name: c.name,
        status: 'pending' as const,
        optional: c.optional,
      })));
    }
  }, [checksConfig, checksComplete, checksRunning, checks.length]);

  // Mutations
  const runReleaseMutation = useRunRelease(sources.release);
  const rollbackMutation = useRollback(sources.release);
  const runChecksMutation = useRunChecks(sources.release);

  const allChecksPassed = checks.length > 0 && checks.every(c => c.status === 'success');
  const anyCheckFailed = checks.some(c => c.status === 'error');

  const runPreChecks = async () => {
    setChecksRunning(true);
    setChecksComplete(false);
    // Mark all as running so user sees spinner on each item
    setChecks((prev) => prev.map((c) => ({ ...c, status: 'running' as const, error: undefined, duration: undefined })));

    try {
      const result = await runChecksMutation.mutateAsync({ scope: selectedScope });

      // Merge results by id — preserve any checks not returned by server as pending
      setChecks((prev) => {
        const resultById = new Map(result.checks.map((c) => [c.id, c]));
        return prev.map((c) => {
          const r = resultById.get(c.id);
          if (!r) { return { ...c, status: 'pending' as const }; }
          return { ...c, status: r.success ? 'success' as const : 'error' as const, error: r.error, duration: r.durationMs };
        });
      });
      setChecksComplete(result.success);

      if (!result.success) {
        UIMessage.error('Some checks failed');
      }
    } catch (error) {
      setChecks((prev) => prev.map((c) => ({ ...c, status: 'pending' as const })));
      UIMessage.error(`Checks failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setChecksRunning(false);
    }
  };

  const validateOtp = (): boolean => {
    if (otp && !/^\d{6}$/.test(otp)) {
      setOtpError('OTP must be 6 digits');
      return false;
    }
    setOtpError('');
    return true;
  };

  const handleRunRelease = async () => {
    if (!validateOtp()) {return;}

    setReleaseStarted(true);
    setReleaseError(null);

    try {
      const result = await runReleaseMutation.mutateAsync({
        scope: selectedScope,
        dryRun: false,
        otp,
      });

      // Check if publish actually succeeded (not just HTTP 200)
      if (result.success) {
        setReleaseComplete(true);
        UIMessage.success('Release published successfully!');
        onReleaseComplete();
      } else {
        // Publish failed - extract error messages
        const errorMessage = result.errors?.join(', ') || 'Unknown publish error';
        setReleaseError(errorMessage);
        setReleaseStarted(false); // Allow retry
        UIMessage.error(`Release failed: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setReleaseError(errorMessage);
      setReleaseStarted(false); // Allow retry
      UIMessage.error(`Release failed: ${errorMessage}`);
    }
  };

  const handleRollback = async () => {
    try {
      await rollbackMutation.mutateAsync({
        scope: selectedScope,
      });
      UIMessage.success('Rollback completed successfully');
      // Reset state
      setReleaseComplete(false);
      setReleaseStarted(false);
      setReleaseError(null);
      setChecksComplete(false);
      setChecks(prev => prev.map(c => ({ ...c, status: 'pending', error: undefined, duration: undefined })));
    } catch (error) {
      UIMessage.error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetChecks = () => {
    setChecks((prev) => prev.map((c) => ({ ...c, status: 'pending' as const, error: undefined, duration: undefined })));
    setChecksComplete(false);
  };

  const getCheckIcon = (status: CheckStatus) => {
    switch (status) {
      case 'running':
        return <UIIcon name="LoadingOutlined" style={{ color: '#1890ff' }} />;
      case 'success':
        return <UIIcon name="CheckCircleOutlined" style={{ color: '#52c41a' }} />;
      case 'error':
        return <UIIcon name="CloseCircleOutlined" style={{ color: '#ff4d4f' }} />;
      default:
        return <UIIcon name="SafetyCertificateOutlined" style={{ color: '#8c8c8c' }} />;
    }
  };

  // Show release complete state
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
              <UIButton
                icon={<UIIcon name="RollbackOutlined" />}
                loading={rollbackMutation.isPending}
                danger
              >
                Rollback
              </UIButton>
            </UIPopconfirm>,
          ]}
        />
      </UICard>
    );
  }

  return (
    <div>
      {/* Pre-checks Card */}
      <UICard
        title={
          <UISpace>
            <UIIcon name="BuildOutlined" />
            <span>Pre-release Checks</span>
            {allChecksPassed && <UITag color="success">All Passed</UITag>}
            {anyCheckFailed && <UITag color="error">Failed</UITag>}
          </UISpace>
        }
        style={{ marginBottom: 16 }}
      >
        <UISpace direction="vertical" style={{ width: '100%' }} size="middle">
          {checksConfigLoading && checks.length === 0 && (
            <UISkeleton active lines={4} title={false} />
          )}
          {!checksConfigLoading && checks.length === 0 && (
            <UITypographyText type="secondary">
              No checks configured in kb.config.json release.checks
            </UITypographyText>
          )}

          {checks.map((check) => (
            <div
              key={check.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: check.status === 'error' ? '#fff2f0' : check.status === 'success' ? '#f6ffed' : '#fafafa',
                borderRadius: 8,
                border: `1px solid ${check.status === 'error' ? '#ffccc7' : check.status === 'success' ? '#b7eb8f' : '#d9d9d9'}`,
              }}
            >
              <UISpace>
                {getCheckIcon(check.status)}
                <div>
                  <UISpace>
                    <UITypographyText strong>{check.name}</UITypographyText>
                    {check.optional && <UITag>optional</UITag>}
                  </UISpace>
                  {check.error && (
                    <>
                      <br />
                      <UITypographyText type="danger" style={{ fontSize: 12 }}>
                        {check.error}
                      </UITypographyText>
                    </>
                  )}
                </div>
              </UISpace>
              {check.duration && (
                <UITag>{(check.duration / 1000).toFixed(1)}s</UITag>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8 }}>
            <UIButton
              variant="primary"
              icon={<UIIcon name="BuildOutlined" />}
              onClick={runPreChecks}
              loading={checksRunning}
              disabled={checksComplete}
            >
              {checksRunning ? 'Running Checks...' : 'Run Checks'}
            </UIButton>
            {(checksComplete || anyCheckFailed) && (
              <UIButton onClick={resetChecks}>
                Reset
              </UIButton>
            )}
          </div>
        </UISpace>
      </UICard>

      {/* OTP & Publish Card */}
      <UICard
        title={
          <UISpace>
            <UIIcon name="LockOutlined" />
            <span>npm Publish</span>
          </UISpace>
        }
      >
        {!allChecksPassed && (
          <UIAlert
            message="Complete pre-release checks first"
            description="All checks must pass before you can publish to npm."
            variant="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {releaseError && (
          <UIAlert
            message="Release Failed"
            description={releaseError}
            variant="error"
            showIcon
            closable
            onClose={() => setReleaseError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <UISpace direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Summary */}
          {planData?.plan && (
            <UIAccordion
              size="small"
              items={[
                {
                  key: 'summary',
                  label: 'Release Summary',
                  extra: (
                    <UITag color="blue">{planData.plan.packages.length} package(s)</UITag>
                  ),
                  children: (
                    <div>
                      {planData.plan.packages.map((pkg) => (
                        <div key={pkg.name} style={{ marginBottom: 4 }}>
                          <UITypographyText code>{pkg.name}</UITypographyText>
                          <UITypographyText type="secondary"> {pkg.currentVersion} → </UITypographyText>
                          <UITypographyText strong style={{ color: '#52c41a' }}>{pkg.nextVersion}</UITypographyText>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          )}

          <UIDivider style={{ margin: '8px 0' }} />

          {/* OTP Input */}
          <div>
            <UITypographyText strong style={{ display: 'block', marginBottom: 8 }}>
              npm One-Time Password (OTP) <UITypographyText type="secondary" style={{ fontWeight: 'normal' }}>— optional</UITypographyText>
            </UITypographyText>
            <UITypographyText type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
              Required only if your npm account uses 2FA. Leave empty to publish via NPM_TOKEN.
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
              disabled={!allChecksPassed || releaseStarted}
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
            onClick={handleRunRelease}
            loading={runReleaseMutation.isPending}
            disabled={!allChecksPassed || releaseStarted}
            block
          >
            Publish to npm
          </UIButton>

          <UITypographyText type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
            This action will publish packages to the npm registry
          </UITypographyText>
        </UISpace>
      </UICard>
    </div>
  );
}
