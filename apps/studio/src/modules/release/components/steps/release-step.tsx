/**
 * @module @kb-labs/studio-app/modules/release/components/steps/release-step
 * Step 4: Pre-checks, OTP input, publish, and rollback
 */

import * as React from 'react';
import {
  Button,
  Card,
  Space,
  Typography,
  Alert,
  Input,
  Result,
  Collapse,
  Tag,
  Popconfirm,
  Divider,
  message,
} from 'antd';
import {
  BuildOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDataSources } from '@/providers/data-sources-provider';
import {
  useReleasePlan,
  useRunRelease,
  useRollback,
} from '@kb-labs/studio-data-client';

const { Text } = Typography;

type CheckStatus = 'pending' | 'running' | 'success' | 'error';

interface PreCheck {
  id: string;
  name: string;
  description: string;
  status: CheckStatus;
  error?: string;
  duration?: number;
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

  // Pre-checks state
  const [checks, setChecks] = React.useState<PreCheck[]>([
    {
      id: 'build',
      name: 'Build Packages',
      description: 'Compile TypeScript and bundle packages',
      status: 'pending',
    },
    {
      id: 'tests',
      name: 'Run Tests',
      description: 'Execute test suite (mocked for demo)',
      status: 'pending',
    },
  ]);
  const [checksComplete, setChecksComplete] = React.useState(false);
  const [checksRunning, setChecksRunning] = React.useState(false);

  // Release state
  const [releaseStarted, setReleaseStarted] = React.useState(false);
  const [releaseComplete, setReleaseComplete] = React.useState(false);
  const [releaseError, setReleaseError] = React.useState<string | null>(null);

  // Fetch plan to show summary
  const { data: planData } = useReleasePlan(sources.release, selectedScope, !!selectedScope);

  // Mutations
  const runReleaseMutation = useRunRelease(sources.release);
  const rollbackMutation = useRollback(sources.release);

  const allChecksPassed = checks.every(c => c.status === 'success');
  const anyCheckFailed = checks.some(c => c.status === 'error');

  // Mock pre-check runner
  const runPreChecks = async () => {
    setChecksRunning(true);
    setChecksComplete(false);

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];

      // Set current check to running
      setChecks(prev => prev.map((c, idx) =>
        idx === i ? { ...c, status: 'running' as CheckStatus } : c
      ));

      // Simulate check (1-3 seconds)
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
      const duration = Date.now() - startTime;

      // Simulate success (95% success rate for demo)
      const success = Math.random() > 0.05;

      setChecks(prev => prev.map((c, idx) =>
        idx === i
          ? {
              ...c,
              status: success ? 'success' : 'error',
              duration,
              error: success ? undefined : `${check.name} failed with exit code 1`,
            }
          : c
      ));

      if (!success) {
        setChecksRunning(false);
        return;
      }
    }

    setChecksRunning(false);
    setChecksComplete(true);
  };

  const validateOtp = (): boolean => {
    if (!otp) {
      setOtpError('OTP is required for npm publish');
      return false;
    }
    if (!/^\d{6}$/.test(otp)) {
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
        message.success('Release published successfully!');
        onReleaseComplete();
      } else {
        // Publish failed - extract error messages
        const errorMessage = result.errors?.join(', ') || 'Unknown publish error';
        setReleaseError(errorMessage);
        setReleaseStarted(false); // Allow retry
        message.error(`Release failed: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setReleaseError(errorMessage);
      setReleaseStarted(false); // Allow retry
      message.error(`Release failed: ${errorMessage}`);
    }
  };

  const handleRollback = async () => {
    try {
      await rollbackMutation.mutateAsync({
        scope: selectedScope,
      });
      message.success('Rollback completed successfully');
      // Reset state
      setReleaseComplete(false);
      setReleaseStarted(false);
      setReleaseError(null);
      setChecksComplete(false);
      setChecks(prev => prev.map(c => ({ ...c, status: 'pending', error: undefined, duration: undefined })));
    } catch (error) {
      message.error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetChecks = () => {
    setChecks(prev => prev.map(c => ({ ...c, status: 'pending', error: undefined, duration: undefined })));
    setChecksComplete(false);
  };

  const getCheckIcon = (status: CheckStatus) => {
    switch (status) {
      case 'running':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <SafetyCertificateOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  // Show release complete state
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
              <Button
                icon={<RollbackOutlined />}
                loading={rollbackMutation.isPending}
                danger
              >
                Rollback
              </Button>
            </Popconfirm>,
          ]}
        />
      </Card>
    );
  }

  return (
    <div>
      {/* Pre-checks Card */}
      <Card
        title={
          <Space>
            <BuildOutlined />
            <span>Pre-release Checks</span>
            {allChecksPassed && <Tag color="success">All Passed</Tag>}
            {anyCheckFailed && <Tag color="error">Failed</Tag>}
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
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
              <Space>
                {getCheckIcon(check.status)}
                <div>
                  <Text strong>{check.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {check.error || check.description}
                  </Text>
                </div>
              </Space>
              {check.duration && (
                <Tag>{(check.duration / 1000).toFixed(1)}s</Tag>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              icon={<BuildOutlined />}
              onClick={runPreChecks}
              loading={checksRunning}
              disabled={checksComplete}
            >
              {checksRunning ? 'Running Checks...' : 'Run Checks'}
            </Button>
            {(checksComplete || anyCheckFailed) && (
              <Button onClick={resetChecks}>
                Reset
              </Button>
            )}
          </div>
        </Space>
      </Card>

      {/* OTP & Publish Card */}
      <Card
        title={
          <Space>
            <LockOutlined />
            <span>npm Publish</span>
          </Space>
        }
      >
        {!allChecksPassed && (
          <Alert
            message="Complete pre-release checks first"
            description="All checks must pass before you can publish to npm."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {releaseError && (
          <Alert
            message="Release Failed"
            description={releaseError}
            type="error"
            showIcon
            closable
            onClose={() => setReleaseError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {/* Summary */}
          {planData?.plan && (
            <Collapse
              size="small"
              items={[
                {
                  key: 'summary',
                  label: (
                    <Space>
                      <span>Release Summary</span>
                      <Tag color="blue">{planData.plan.packages.length} package(s)</Tag>
                    </Space>
                  ),
                  children: (
                    <div>
                      {planData.plan.packages.map((pkg) => (
                        <div key={pkg.name} style={{ marginBottom: 4 }}>
                          <Text code>{pkg.name}</Text>
                          <Text type="secondary"> {pkg.currentVersion} → </Text>
                          <Text strong style={{ color: '#52c41a' }}>{pkg.nextVersion}</Text>
                        </div>
                      ))}
                    </div>
                  ),
                },
              ]}
            />
          )}

          <Divider style={{ margin: '8px 0' }} />

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
              disabled={!allChecksPassed || releaseStarted}
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
            onClick={handleRunRelease}
            loading={runReleaseMutation.isPending}
            disabled={!allChecksPassed || !otp || releaseStarted}
            block
          >
            Publish to npm
          </Button>

          <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
            This action will publish packages to the npm registry
          </Text>
        </Space>
      </Card>
    </div>
  );
}
