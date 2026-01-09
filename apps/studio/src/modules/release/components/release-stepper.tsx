/**
 * @module @kb-labs/studio-app/modules/release/components/release-stepper
 * Stepper-based release flow: Plan → Changelog → Preview → Release
 */

import * as React from 'react';
import {
  Steps,
  Button,
  Card,
  Result,
} from 'antd';
import {
  FileTextOutlined,
  EditOutlined,
  FolderOutlined,
  RocketOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { PlanStep } from './steps/plan-step';
import { ChangelogStep } from './steps/changelog-step';
import { PreviewStep } from './steps/preview-step';
import { ReleaseStep } from './steps/release-step';

interface ReleaseStepperProps {
  selectedScope: string;
}

export function ReleaseStepper({ selectedScope }: ReleaseStepperProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [releaseComplete, setReleaseComplete] = React.useState(false);

  // Step validation states
  const [planReady, setPlanReady] = React.useState(false);
  const [changelogReady, setChangelogReady] = React.useState(false);
  const [previewReady, setPreviewReady] = React.useState(false);

  const steps = [
    {
      title: 'Plan',
      icon: <FileTextOutlined />,
    },
    {
      title: 'Changelog',
      icon: <EditOutlined />,
    },
    {
      title: 'Preview',
      icon: <FolderOutlined />,
    },
    {
      title: 'Release',
      icon: <RocketOutlined />,
    },
  ];

  const canGoNext = () => {
    if (currentStep === 0) return planReady;
    if (currentStep === 1) return changelogReady;
    if (currentStep === 2) return previewReady;
    return false;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReleaseComplete = () => {
    setReleaseComplete(true);
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setReleaseComplete(false);
    setPlanReady(false);
    setChangelogReady(false);
    setPreviewReady(false);
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

  if (releaseComplete) {
    return (
      <Card>
        <Result
          status="success"
          title="Release Complete!"
          subTitle="Your packages have been published successfully."
          extra={[
            <Button key="history" onClick={() => window.location.href = '/release/history'}>
              View History
            </Button>,
            <Button key="new" type="primary" onClick={handleStartOver}>
              Start New Release
            </Button>,
          ]}
        />
      </Card>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PlanStep
            selectedScope={selectedScope}
            onPlanReady={setPlanReady}
          />
        );
      case 1:
        return (
          <ChangelogStep
            selectedScope={selectedScope}
            onChangelogReady={setChangelogReady}
          />
        );
      case 2:
        return (
          <PreviewStep
            selectedScope={selectedScope}
            onPreviewReady={setPreviewReady}
          />
        );
      case 3:
        return (
          <ReleaseStep
            selectedScope={selectedScope}
            onReleaseComplete={handleReleaseComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Navigation stepper */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Steps
            current={currentStep}
            items={steps}
            type="navigation"
            size="small"
            onChange={(step) => {
              // Only allow going back to completed steps
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }}
            style={{ flex: 1 }}
          />

          {/* Navigation buttons */}
          {currentStep < 3 && (
            <div style={{ display: 'flex', gap: 8, marginLeft: 32, flexShrink: 0 }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handlePrev}
                disabled={currentStep === 0}
                size="small"
              >
                Back
              </Button>
              <Button
                type="primary"
                onClick={handleNext}
                disabled={!canGoNext()}
                size="small"
              >
                Next <ArrowRightOutlined />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Step content */}
      {renderStepContent()}
    </div>
  );
}
