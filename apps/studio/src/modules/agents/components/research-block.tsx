/**
 * @module ResearchBlock
 * Flat tree-style research display (Claude Code inspired)
 */

import React from 'react';
import { UITypographyText, useUITheme } from '@kb-labs/studio-ui-kit';
import { StepItem, type ResearchStep } from './step-item';

interface ResearchBlockProps {
  steps: ResearchStep[];
  isRunning: boolean;
}

export function ResearchBlock({ steps, isRunning }: ResearchBlockProps) {
  const { token } = useUITheme();

  if (steps.length === 0) {
    return null;
  }

  // Calculate stats
  const completedCount = steps.filter(s => s.status === 'done').length;
  const errorCount = steps.filter(s => s.status === 'error').length;
  const totalDuration = steps.reduce((sum, s) => sum + (s.duration || 0), 0);

  return (
    <div
      style={{
        marginBottom: 16,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 8 }}>
        <UITypographyText strong style={{ fontSize: 13, color: token.colorTextSecondary }}>
          Research
        </UITypographyText>
        <UITypographyText type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
          {isRunning ? (
            <span style={{ color: token.colorPrimary }}>running</span>
          ) : (
            `${completedCount}/${steps.length} steps - ${(totalDuration / 1000).toFixed(1)}s`
          )}
          {errorCount > 0 && (
            <span style={{ color: token.colorError, marginLeft: 8 }}>
              {errorCount} failed
            </span>
          )}
        </UITypographyText>
      </div>

      {/* Tree */}
      {steps.map((step, index) => (
        <StepItem
          key={step.id}
          step={step}
          isLast={index === steps.length - 1}
          level={0}
        />
      ))}
    </div>
  );
}
