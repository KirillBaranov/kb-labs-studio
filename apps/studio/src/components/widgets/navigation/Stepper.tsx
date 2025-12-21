/**
 * @module @kb-labs/studio-app/components/widgets/navigation/Stepper
 * Stepper widget - step wizard navigation
 */

import * as React from 'react';
import { Steps } from 'antd';
import type { BaseWidgetProps } from '../types';
import type {
  StepperOptions as ContractOptions,
  StepperData,
  StepDef,
} from '@kb-labs/studio-contracts';

export interface StepperOptions extends ContractOptions {}

export interface StepperProps extends BaseWidgetProps<StepperData, StepperOptions> {
  /** Callback when step is clicked */
  onStepChange?: (stepIndex: number) => void;
}

export function Stepper({ data, options, onStepChange }: StepperProps) {
  const {
    steps: optionSteps,
    currentStep: optionCurrentStep = 0,
    direction = 'horizontal',
    labelPlacement = 'horizontal',
    clickable = false,
    progressDot = false,
    size = 'md',
    type = 'default',
    previousOnly = false,
    showNumbers = true,
  } = options ?? {};

  // Merge from data and options
  const steps: StepDef[] = data?.steps ?? optionSteps ?? [];
  const currentStep = data?.currentStep ?? optionCurrentStep;
  const completedSteps = data?.completedSteps ?? [];
  const errorSteps = data?.errorSteps ?? [];

  if (steps.length === 0) {
    return null;
  }

  const sizeMap: Record<string, 'small' | 'default'> = {
    sm: 'small',
    md: 'default',
  };

  const handleStepClick = (index: number) => {
    if (!clickable) return;
    if (previousOnly && index > currentStep) return;
    onStepChange?.(index);
  };

  const getStepStatus = (step: StepDef, index: number): 'wait' | 'process' | 'finish' | 'error' => {
    // Check for explicit error
    if (errorSteps.includes(index) || step.status === 'error') {
      return 'error';
    }
    // Check for explicit status
    if (step.status) {
      return step.status;
    }
    // Auto-determine based on position
    if (completedSteps.includes(index) || index < currentStep) {
      return 'finish';
    }
    if (index === currentStep) {
      return 'process';
    }
    return 'wait';
  };

  const items = steps.map((step, index) => ({
    title: step.title,
    description: step.description,
    subTitle: step.subtitle,
    icon: step.icon ? <span>{step.icon}</span> : undefined,
    status: getStepStatus(step, index),
    disabled: step.disabled,
  }));

  return (
    <Steps
      current={currentStep}
      direction={direction}
      labelPlacement={labelPlacement}
      progressDot={progressDot}
      size={sizeMap[size]}
      type={type}
      items={items}
      onChange={clickable ? handleStepClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    />
  );
}
