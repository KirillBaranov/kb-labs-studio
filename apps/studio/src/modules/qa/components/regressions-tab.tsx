/**
 * @module @kb-labs/studio-app/modules/qa/components/regressions-tab
 * Regressions tab - detect and display new failures since last QA save
 */

import * as React from 'react';
import { UIAlert, UICard, UITag, UISpin, UISpace, UIEmptyState, UIIcon } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useQARegressions } from '@kb-labs/studio-data-client';

const CHECK_ICONS: Record<string, React.ReactNode> = {
  build: <UIIcon name="BuildOutlined" />,
  lint: <UIIcon name="FileSearchOutlined" />,
  typeCheck: <UIIcon name="FileTextOutlined" />,
  test: <UIIcon name="ExperimentOutlined" />,
};

const CHECK_LABELS: Record<string, string> = {
  build: 'Build',
  lint: 'Lint',
  typeCheck: 'Type Check',
  test: 'Tests',
};

export function RegressionsTab() {
  const sources = useDataSources();
  const { data, isLoading } = useQARegressions(sources.qa);

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <UISpin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <UIAlert
        variant="info"
        showIcon
        message="Not enough data for regression detection"
        description="Need at least 2 history entries. Run 'pnpm qa:save' multiple times."
      />
    );
  }

  if (!data.hasRegressions) {
    return (
      <div>
        <UIAlert
          variant="success"
          showIcon
          icon={<UIIcon name="CheckCircleOutlined" />}
          message="No regressions detected"
          description="All check types show the same or fewer failures compared to the previous QA run."
          style={{ marginBottom: 24 }}
        />
        <UIEmptyState description="No regressions to display" />
      </div>
    );
  }

  return (
    <div>
      <UIAlert
        variant="error"
        showIcon
        icon={<UIIcon name="WarningOutlined" />}
        message={`${data.regressions.length} regression${data.regressions.length > 1 ? 's' : ''} detected`}
        description="The following check types have new failures compared to the previous QA run."
        style={{ marginBottom: 24 }}
      />

      {data.regressions.map((reg, idx) => (
        <UICard
          key={idx}
          title={
            <UISpace>
              {CHECK_ICONS[reg.checkType]}
              <span>{CHECK_LABELS[reg.checkType] ?? reg.checkType}</span>
              <UITag color="error">+{reg.delta} new failure{reg.delta > 1 ? 's' : ''}</UITag>
            </UISpace>
          }
          style={{ marginBottom: 16 }}
        >
          <div>
            <strong>New failures:</strong>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {reg.newFailures.map((pkg) => (
                <UITag key={pkg} color="error">
                  {pkg}
                </UITag>
              ))}
            </div>
          </div>
        </UICard>
      ))}

      <UIAlert
        variant="warning"
        showIcon
        message="Action required"
        description={
          <div>
            <p>Fix the regressions above before merging. Recommendations:</p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Run <code>pnpm qa --json</code> to see detailed error messages</li>
              <li>Fix the failing packages</li>
              <li>Re-run <code>pnpm qa:save</code> to verify fixes</li>
              <li>Update baseline if needed: <code>pnpm kb baseline:update</code></li>
            </ol>
          </div>
        }
        style={{ marginTop: 16 }}
      />
    </div>
  );
}
