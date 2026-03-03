/**
 * @module @kb-labs/studio-app/modules/release/pages/release-page
 * Release Manager main page with scope-based workflow
 */

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { UISelect, UIAccordion, UIDescriptions, UIDescriptionsItem, UITag } from '@kb-labs/studio-ui-kit';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleaseScopes } from '@kb-labs/studio-data-client';
import { ReleaseStepper } from '../components/release-stepper';
import { HistoryTab } from '../components/history-tab';
import { KBPageContainer, KBPageHeader } from '@/components/ui';

interface ReleasePageProps {
  view?: 'overview' | 'history';
}

export function ReleasePage({ view = 'overview' }: ReleasePageProps) {
  const sources = useDataSources();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedScope = searchParams.get('scope') ?? '';

  const setSelectedScope = (scope: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('scope', scope);
      next.delete('step'); // reset step when scope changes
      return next;
    });
  };

  // Fetch available scopes
  const { data: scopesData, isLoading: scopesLoading } = useReleaseScopes(sources.release);

  // Auto-select first scope (prefer root if available)
  React.useEffect(() => {
    if (scopesData?.scopes && scopesData.scopes.length > 0 && !selectedScope) {
      const rootScope = scopesData.scopes.find((s) => s.id === 'root');
      const firstScope = scopesData.scopes[0];
      setSelectedScope(rootScope?.id ?? firstScope?.id ?? '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopesData]);

  // Get current scope info
  const currentScope = scopesData?.scopes?.find((s) => s.id === selectedScope);

  // Type badge color
  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'monorepo':
        return 'blue';
      case 'package':
        return 'green';
      case 'root':
        return 'purple';
      default:
        return 'default';
    }
  };

  // Render content based on view
  const renderContent = () => {
    if (view === 'history') {
      return <HistoryTab selectedScope={selectedScope} />;
    }

    // Overview with stepper-based release flow
    return (
      <div style={{ marginTop: 16 }}>
        <ReleaseStepper selectedScope={selectedScope} selectedScopePath={currentScope?.path} />
      </div>
    );
  };

  const pageTitle = view === 'history' ? 'Release History' : 'Release Manager';
  const pageDescription = view === 'history'
    ? 'View past releases and their reports'
    : 'Plan, execute, and audit releases across your workspace';

  return (
    <KBPageContainer>
      <KBPageHeader
        title={pageTitle}
        description={pageDescription}
        extra={
          <UISelect
            style={{ width: 400 }}
            placeholder="Select scope (package or monorepo)"
            value={selectedScope}
            onChange={(v) => setSelectedScope(v as string)}
            loading={scopesLoading}
            showSearch
            optionFilterProp="label"
            options={scopesData?.scopes?.map((s) => ({
              label: `${s.name} (${s.type})`,
              value: s.id,
            })) ?? []}
          />
        }
      />

      {/* Scope Info Accordion */}
      {currentScope && (
        <UIAccordion
          size="small"
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'scope-info',
              label: currentScope.currentVersion
                ? `${currentScope.name} v${currentScope.currentVersion}`
                : currentScope.name,
              extra: (
                <UITag color={getTypeColor(currentScope.type)}>
                  {currentScope.type}
                </UITag>
              ),
              children: (
                <UIDescriptions size="small" column={1} bordered>
                  <UIDescriptionsItem label="Package Name">{currentScope.id}</UIDescriptionsItem>
                  {currentScope.currentVersion && (
                    <UIDescriptionsItem label="Current Version">
                      {currentScope.currentVersion}
                    </UIDescriptionsItem>
                  )}
                  {currentScope.description && (
                    <UIDescriptionsItem label="Description">
                      {currentScope.description}
                    </UIDescriptionsItem>
                  )}
                  <UIDescriptionsItem label="Path">
                    <code style={{ fontSize: 12 }}>{currentScope.path}</code>
                  </UIDescriptionsItem>
                  <UIDescriptionsItem label="Type">
                    <UITag color={getTypeColor(currentScope.type)}>{currentScope.type}</UITag>
                  </UIDescriptionsItem>
                </UIDescriptions>
              ),
            },
          ]}
        />
      )}

      {renderContent()}
    </KBPageContainer>
  );
}
