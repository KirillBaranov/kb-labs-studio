/**
 * @module @kb-labs/studio-app/modules/qa/components/baseline-diff-card
 * Shows baseline diff with new failures, fixed packages, and delta per check type.
 * Includes "Update Baseline" button.
 */

import * as React from 'react';
import {
  UICard,
  UIRow,
  UICol,
  UITag,
  UITypographyText,
  UIAlert,
  UIButton,
  UIPopconfirm,
  UIMessage,
  UISpace,
  UIStatistic,
  UIIcon,
} from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQABaselineDiff, useQAUpdateBaseline } from '@kb-labs/studio-data-client';
import { formatCheckLabel } from '../utils/check-display';

export function BaselineDiffCard() {
  const sources = useDataSources();
  const { data: diffData, isLoading } = useQABaselineDiff(sources.qa);
  const { mutate: updateBaseline, isPending: isUpdating } = useQAUpdateBaseline(sources.qa);

  const handleUpdateBaseline = () => {
    void UIMessage.loading('Updating baseline...', 0);
    updateBaseline(undefined, {
      onSuccess: () => {
        UIMessage.destroy();
        UIMessage.success('Baseline updated successfully');
      },
      onError: (error) => {
        UIMessage.destroy();
        UIMessage.error(`Failed to update baseline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      },
    });
  };

  if (isLoading) {return null;}

  if (!diffData?.baseline) {
    return (
      <UIAlert
        variant="warning"
        showIcon
        message="No baseline set"
        description="Run QA first, then update baseline to enable diff tracking."
        action={
          <UIButton
            variant="primary"
            size="small"
            icon={<UIIcon name="SaveOutlined" />}
            onClick={handleUpdateBaseline}
            loading={isUpdating}
          >
            Create Baseline
          </UIButton>
        }
      />
    );
  }

  if (!diffData.hasDiff) {
    return (
      <UIAlert
        variant="success"
        showIcon
        icon={<UIIcon name="CheckCircleOutlined" />}
        message="No changes since baseline"
        description={`Baseline from ${new Date(diffData.baseline.timestamp).toLocaleString()}`}
        action={
          <UIPopconfirm
            title="Update baseline?"
            description="This will set the current QA state as the new baseline."
            onConfirm={handleUpdateBaseline}
          >
            <UIButton size="small" icon={<UIIcon name="SaveOutlined" />} loading={isUpdating}>
              Update
            </UIButton>
          </UIPopconfirm>
        }
      />
    );
  }

  // Calculate totals
  let totalNew = 0;
  let totalFixed = 0;
  for (const d of Object.values(diffData.diff)) {
    totalNew += d.newFailures.length;
    totalFixed += d.fixed.length;
  }

  return (
    <UICard
      title={
        <UISpace>
          <UIIcon name="WarningOutlined" style={{ color: totalNew > 0 ? '#ff4d4f' : '#52c41a' }} />
          <span>Baseline Diff</span>
          {totalNew > 0 && <UITag color="error">+{totalNew} new failures</UITag>}
          {totalFixed > 0 && <UITag color="success">{totalFixed} fixed</UITag>}
        </UISpace>
      }
      extra={
        <UIPopconfirm
          title="Update baseline?"
          description="This will set the current QA state as the new baseline."
          onConfirm={handleUpdateBaseline}
        >
          <UIButton variant="primary" icon={<UIIcon name="SaveOutlined" />} loading={isUpdating} size="small">
            Update Baseline
          </UIButton>
        </UIPopconfirm>
      }
    >
      <UIRow gutter={[16, 16]}>
        {Object.entries(diffData.diff).map(([ct, d]) => (
          <UICol xs={24} sm={12} lg={6} key={ct}>
            <UICard size="small" style={{ textAlign: 'center' }}>
              <UITypographyText strong>{formatCheckLabel(ct)}</UITypographyText>
              <div style={{ marginTop: 8 }}>
                <UIStatistic
                  value={Math.abs(d.delta)}
                  prefix={d.delta > 0 ? <UIIcon name="ArrowUpOutlined" /> : d.delta < 0 ? <UIIcon name="ArrowDownOutlined" /> : null}
                  valueStyle={{
                    color: d.delta > 0 ? '#ff4d4f' : d.delta < 0 ? '#52c41a' : '#8c8c8c',
                    fontSize: 20,
                  }}
                  suffix={d.delta > 0 ? 'more failures' : d.delta < 0 ? 'fewer failures' : 'no change'}
                />
              </div>
              {d.newFailures.length > 0 && (
                <div style={{ marginTop: 8, textAlign: 'left' }}>
                  <UITypographyText type="danger" style={{ fontSize: 12 }}>New failures:</UITypographyText>
                  {d.newFailures.slice(0, 3).map((pkg) => (
                    <div key={pkg}><UITag color="error" style={{ fontSize: 11 }}>{pkg}</UITag></div>
                  ))}
                  {d.newFailures.length > 3 && (
                    <UITypographyText type="secondary" style={{ fontSize: 11 }}>
                      +{d.newFailures.length - 3} more
                    </UITypographyText>
                  )}
                </div>
              )}
              {d.fixed.length > 0 && (
                <div style={{ marginTop: 8, textAlign: 'left' }}>
                  <UITypographyText type="success" style={{ fontSize: 12 }}>Fixed:</UITypographyText>
                  {d.fixed.slice(0, 3).map((pkg) => (
                    <div key={pkg}><UITag color="success" style={{ fontSize: 11 }}>{pkg}</UITag></div>
                  ))}
                  {d.fixed.length > 3 && (
                    <UITypographyText type="secondary" style={{ fontSize: 11 }}>
                      +{d.fixed.length - 3} more
                    </UITypographyText>
                  )}
                </div>
              )}
            </UICard>
          </UICol>
        ))}
      </UIRow>
    </UICard>
  );
}
