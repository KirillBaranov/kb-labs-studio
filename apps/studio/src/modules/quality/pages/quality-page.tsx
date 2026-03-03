/**
 * @module @kb-labs/studio-app/modules/quality/pages/quality-page
 * Quality plugin main page - monorepo health and analysis dashboard
 */

import * as React from 'react';
import { UITabs } from '@kb-labs/studio-ui-kit';
import { OverviewTab } from '../components/overview-tab';
import { DependenciesTab } from '../components/dependencies-tab';
import { BuildOrderTab } from '../components/build-order-tab';
import { GraphTab } from '../components/graph-tab';
import { StaleTab } from '../components/stale-tab';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

export function QualityPage() {
  const tabItems = [
    {
      key: 'overview',
      label: 'Overview',
      children: <OverviewTab />,
    },
    {
      key: 'dependencies',
      label: 'Dependencies',
      children: <DependenciesTab />,
    },
    {
      key: 'build-order',
      label: 'Build Order',
      children: <BuildOrderTab />,
    },
    {
      key: 'graph',
      label: 'Dependency Graph',
      children: <GraphTab />,
    },
    {
      key: 'stale',
      label: 'Stale Packages',
      children: <StaleTab />,
    },
  ];

  return (
    <KBPageContainer>
      <KBPageHeader
        title="Quality"
        description="Monorepo health metrics, dependency analysis, and build order visualization"
      />

      <UITabs
        items={tabItems}
        syncUrl={{ mode: 'path', basePath: '/quality' }}
        size="large"
        style={{ marginTop: 24 }}
      />
    </KBPageContainer>
  );
}
