/**
 * @module @kb-labs/studio-app/modules/release/components/release-stepper
 * Stepper-based release flow: Plan → Changelog → Preview → Release
 */

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  UISteps,
  UIButton,
  UICard,
  UIResult,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { PlanStep } from './steps/plan-step';
import { ChangelogStep } from './steps/changelog-step';
import { PreviewStep } from './steps/preview-step';
import { ReleaseStep } from './steps/release-step';
import { useDataSources } from '@/providers/data-sources-provider';
import { useResetReleasePlan } from '@kb-labs/studio-data-client';

type StepKey = 'plan' | 'changelog' | 'preview' | 'release';

const STEP_KEYS: StepKey[] = ['plan', 'changelog', 'preview', 'release'];

const STEP_INDEX: Record<StepKey, number> = {
  plan: 0,
  changelog: 1,
  preview: 2,
  release: 3,
};

interface ReleaseStepperProps {
  selectedScope: string;
  selectedScopePath?: string;
}

export function ReleaseStepper({ selectedScope, selectedScopePath }: ReleaseStepperProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sources = useDataSources();
  const resetPlan = useResetReleasePlan(sources.release);

  const stepParam = searchParams.get('step') as StepKey | null;
  const currentStep = STEP_INDEX[stepParam as StepKey] ?? 0;

  const setCurrentStep = (index: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('step', STEP_KEYS[index] ?? 'plan');
      return next;
    });
  };

  const [releaseComplete, setReleaseComplete] = React.useState(false);

  // Step validation states
  const [planReady, setPlanReady] = React.useState(false);
  const [changelogReady, setChangelogReady] = React.useState(false);
  const [previewReady, setPreviewReady] = React.useState(false);

  const steps = [
    { title: 'Plan', icon: <UIIcon name="FileTextOutlined" /> },
    { title: 'Changelog', icon: <UIIcon name="EditOutlined" /> },
    { title: 'Preview', icon: <UIIcon name="FolderOutlined" /> },
    { title: 'Release', icon: <UIIcon name="RocketOutlined" /> },
  ];

  const canGoNext = () => {
    if (currentStep === 0) { return planReady; }
    if (currentStep === 1) { return changelogReady; }
    if (currentStep === 2) { return previewReady; }
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
    resetPlan.mutate({ scope: selectedScope });
    setCurrentStep(0);
    setReleaseComplete(false);
    setPlanReady(false);
    setChangelogReady(false);
    setPreviewReady(false);
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

  if (releaseComplete) {
    return (
      <UICard>
        <UIResult
          status="success"
          title="Release Complete!"
          subTitle="Your packages have been published successfully."
          extra={[
            <UIButton key="history" onClick={() => window.location.href = '/release/history'}>
              View History
            </UIButton>,
            <UIButton key="new" variant="primary" onClick={handleStartOver}>
              Start New Release
            </UIButton>,
          ]}
        />
      </UICard>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PlanStep selectedScope={selectedScope} selectedScopePath={selectedScopePath} onPlanReady={setPlanReady} />;
      case 1:
        return <ChangelogStep selectedScope={selectedScope} onChangelogReady={setChangelogReady} />;
      case 2:
        return <PreviewStep selectedScope={selectedScope} onPreviewReady={setPreviewReady} />;
      case 3:
        return <ReleaseStep selectedScope={selectedScope} onReleaseComplete={handleReleaseComplete} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Navigation stepper */}
      <UICard size="small" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <UISteps
            current={currentStep}
            items={steps}
            type="navigation"
            size="small"
            onChange={(step) => {
              // Allow clicking back to any already-visited step
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }}
            style={{ flex: 1 }}
          />

          {/* Navigation buttons — always visible */}
          <div style={{ display: 'flex', gap: 8, marginLeft: 32, flexShrink: 0 }}>
            <UIButton
              icon={<UIIcon name="ArrowLeftOutlined" />}
              onClick={handlePrev}
              disabled={currentStep === 0}
              size="small"
            >
              Back
            </UIButton>
            {currentStep < steps.length - 1 && (
              <UIButton
                variant="primary"
                onClick={handleNext}
                disabled={!canGoNext()}
                size="small"
              >
                Next <UIIcon name="ArrowRightOutlined" />
              </UIButton>
            )}
          </div>
        </div>
      </UICard>

      {/* Step content */}
      {renderStepContent()}
    </div>
  );
}
