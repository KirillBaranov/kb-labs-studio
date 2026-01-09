/**
 * @module @kb-labs/studio-app/modules/release/pages/release-page
 * Release Manager main page with scope-based workflow
 */

import * as React from 'react';
import { Select, Collapse, Descriptions, Tag } from 'antd';
import { KBPageContainer, KBPageHeader } from '@kb-labs/studio-ui-react';
import { useDataSources } from '@/providers/data-sources-provider';
import { useReleaseScopes } from '@kb-labs/studio-data-client';
import { ReleaseStepper } from '../components/release-stepper';
import { HistoryTab } from '../components/history-tab';

interface ReleasePageProps {
  view?: 'overview' | 'history';
}

export function ReleasePage({ view = 'overview' }: ReleasePageProps) {
  const sources = useDataSources();
  const [selectedScope, setSelectedScope] = React.useState<string>('');

  // Fetch available scopes
  const { data: scopesData, isLoading: scopesLoading } = useReleaseScopes(sources.release);

  // Auto-select first scope (prefer root if available)
  React.useEffect(() => {
    if (scopesData?.scopes && scopesData.scopes.length > 0 && !selectedScope) {
      const rootScope = scopesData.scopes.find((s) => s.id === 'root');
      setSelectedScope(rootScope?.id || scopesData.scopes[0].id);
    }
  }, [scopesData, selectedScope]);

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
        <ReleaseStepper selectedScope={selectedScope} />
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
          <Select
            style={{ width: 400 }}
            placeholder="Select scope (package or monorepo)"
            value={selectedScope}
            onChange={setSelectedScope}
            loading={scopesLoading}
            showSearch
            optionFilterProp="label"
            options={scopesData?.scopes?.map((s) => ({
              label: `${s.name} (${s.type})`,
              value: s.id,
              title: `${s.path} · v${s.currentVersion || '?'}`,
            }))}
          />
        }
      />

      {/* Scope Info Accordion */}
      {currentScope && (
        <Collapse
          size="small"
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'scope-info',
              label: (
                <span>
                  <strong>{currentScope.name}</strong>
                  {currentScope.currentVersion && (
                    <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
                      v{currentScope.currentVersion}
                    </span>
                  )}
                  <Tag color={getTypeColor(currentScope.type)} style={{ marginLeft: 8 }}>
                    {currentScope.type}
                  </Tag>
                </span>
              ),
              children: (
                <Descriptions size="small" column={1} bordered>
                  <Descriptions.Item label="Package Name">{currentScope.id}</Descriptions.Item>
                  {currentScope.currentVersion && (
                    <Descriptions.Item label="Current Version">
                      {currentScope.currentVersion}
                    </Descriptions.Item>
                  )}
                  {currentScope.description && (
                    <Descriptions.Item label="Description">
                      {currentScope.description}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Path">
                    <code style={{ fontSize: 12 }}>{currentScope.path}</code>
                  </Descriptions.Item>
                  <Descriptions.Item label="Type">
                    <Tag color={getTypeColor(currentScope.type)}>{currentScope.type}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              ),
            },
          ]}
        />
      )}

      {renderContent()}
    </KBPageContainer>
  );
}
