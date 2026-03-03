/**
 * @module @kb-labs/studio-app/modules/qa/pages/qa-page
 * QA plugin main page - build, lint, type check, and test results dashboard
 */

import * as React from 'react';
import { UITabs } from '@kb-labs/studio-ui-kit';
import { OverviewTab } from '../components/overview-tab';
import { HistoryTab } from '../components/history-tab';
import { TrendsTab } from '../components/trends-tab';
import { RegressionsTab } from '../components/regressions-tab';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

export function QADashboardPage() {
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: <OverviewTab />,
    },
    {
      key: 'history',
      label: 'History',
      children: <HistoryTab />,
    },
    {
      key: 'trends',
      label: 'Trends',
      children: <TrendsTab />,
    },
    {
      key: 'regressions',
      label: 'Regressions',
      children: <RegressionsTab />,
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="QA"
        description="Build, lint, type check, and test results with baseline tracking and regression detection"
      />

      <UITabs
        items={tabItems}
        syncUrl={{ mode: 'path', basePath: '/qa' }}
        size="large"
        style={{ marginTop: 24 }}
      />
    </KBPageContainer>
  );
}
